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
  const pressY=k=>k?fretY(k-1)+.7*(fretY(k)-fretY(k-1)):NUT+.01;
  GHOLD.fretY=fretY; GHOLD.strAt=strAt;
  // where each finger of the right hand plucks (a share of the string from the bridge: the thumb nearest the soundhole), and the strum
  const PLY={p:.29,i:.255,m:.225,a:.195,s:.3}, plY=r=>SAD+(PLY[r]||.2)*L;
  GHOLD.plFrac=r=>PLY[r]||.2;

  /* ---------- held against the body: the guitar's frame in the body's rest space (metres, the body facing +z, its left +x) ---------- */
  const HOLD={neck:[.84,.5,.2],top:[-.12,.3,1],at:[-.05,.97,.17],back:[0,F.hole[0],-F.d]};
  const GB=(()=>{ const y=new V3(...HOLD.neck).normalize(), z0=new V3(...HOLD.top), z=z0.sub(y.clone().multiplyScalar(z0.dot(y))).normalize(), x=new V3().crossVectors(y,z), M=new M4().makeBasis(x,y,z);
    const p=new V3(...HOLD.back).applyMatrix4(M); M.setPosition(new V3(...HOLD.at).sub(p)); return M; })();
  GHOLD.HOLD=HOLD;

  /* ---------- a score at a time: the left hand's presses, the right hand's plucks and strums (108's book compiled, or what you play, the same shape) ---------- */
  const sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); }, mix=(a,b,u,o=new V3())=>o.copy(a).lerp(b,u);
  const posAt=(sc,t)=>{ const P=sc.pos; if(!P||!P.length)return 1; let a=P[0], i=0; for(let j=0;j<P.length;j++){ if(P[j].t-.15>t)break; a=P[j]; i=j; } const pv=i>0?P[i-1]:a, u=sm((t-(a.t-.15))/.13); return pv.p+(a.p-pv.p)*u; };
  GHOLD.posAt=posAt;
  const UP=new V3(0,0,1);
  // the left hand's fingertips (index to little finger): a press is the string at its fret, pressed onto the board; free fingers hover over where they go next
  const left=(sc,t,out,w)=>{ const p=posAt(sc,t), press=q=>strAt(q.s,pressY(q.k)).setZ(FB+.006), hover=q=>q?strAt(q.s,pressY(q.k)).addScaledVector(UP,.016):strAt(3+(w.f>2?1:0),pressY(Math.max(1,Math.round(p)+w.f-1))).addScaledVector(UP,.018);
    for(let f=1;f<=4;f++){ let cur=null, prev=null, next=null; w.f=f;
      for(const q of sc.lh){ if(q.f!==f)continue; if(q.t0<=t&&t<q.t1){ if(!cur||q.s>cur.s)cur=q; } else if(q.t1<=t)prev=q; else if(!next&&q.t0>t)next=q; }
      if(cur){ out[f].copy(press(cur)); continue; }
      if(next&&next.t0-t<.1){ mix(hover(next),press(next),sm(1-(next.t0-t)/.1),out[f]); continue; }
      if(prev&&t-prev.t1<.08){ mix(press(prev),hover(prev),sm((t-prev.t1)/.08),out[f]); continue; }
      const a=(prev?prev.t1:t)+.08, b=(next?next.t0:t+1)-.1; mix(hover(prev||next),hover(next||prev),sm((t-a)/Math.max(.05,b-a)),out[f]); }
    // the thumb behind the neck, under the middle of the hand
    out[0].copy(strAt(3,pressY(Math.max(1,Math.round(p))+1))).setX(-.012).setZ(FB-.055);
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
  const aim=(W,h,side,Fd,Dd)=>{ const z=Fd.clone().normalize(), y=Dd.clone().addScaledVector(z,-Dd.dot(z)).normalize(), x=new V3().crossVectors(y,z), R=new M4().makeBasis(x,y,z).multiply(HANDS.LOC[side].clone().transpose());
    const p=org(W[h],new V3()), k=VA.setFromMatrixColumn(W[h],0).length(); W[h].copy(R).scale(VA.set(k,k,k)).setPosition(p); };

  /* ---------- a body holding it: GHOLD.attach puts the guitar on it and a step on its pose (PM.post, 111a) ---------- */
  const DIRS={Lf:new V3(-.5,-.05,.85),Ld:new V3(.85,-.1,.5),Rf:new V3(.85,-.1,-.5),Rd:new V3(.15,.25,1),Lpole:new V3(.35,-1,-.15),Rpole:new V3(-.3,-1,-.45)};   // (the elbows' aims in the body's own frame: +x its left, +y up, +z ahead; the left hangs under the neck, the right rests behind the upper bout)
  GHOLD.DIRS=DIRS; GHOLD.stage=4;   // (for checking the hold a stage at a time: 1 the upper arms out, 2 the elbows bent, 3 the hands turned, fingers open, 4 the fingers placed)
  GHOLD.attach=(me,PM,body,src)=>{ if(!body.binv)return null; const gm=GHOLD.model(); gm.matrixAutoUpdate=false; me.add(gm);
    const restM=body.binv.map(m=>m.clone().invert()), W=restM.map(()=>new M4()), Gm=new M4(), tgL=[0,1,2,3,4].map(()=>new V3()), tgR=[0,1,2,3,4].map(()=>new V3());
    const fg={L:HANDS.R0.map(f=>f.slice()),R:HANDS.R0.map(f=>f.slice())}, W0=restM.map(()=>new M4()), H={me,PM,gm,src,fg,on:true,off:{L:new V3(),R:new V3()}};
    const toG=(v,o)=>o.copy(v).applyMatrix4(Gm), dirG=(v,o)=>o.copy(v).transformDirection(Gm); let PB=null; const dirB=v=>new V3().copy(v).transformDirection(PB);
    PM.post=(PMx,b)=>{ if(!H.on)return; const P=PMx.value, sc=src.score(), t=src.time();
      for(let i=0;i<15;i++)W[i].multiplyMatrices(P[i],restM[i]);
      PB=P[1];
      Gm.multiplyMatrices(P[1],GB); gm.matrix.copy(Gm); gm.matrixWorldNeedsUpdate=true;
      // the head looks down at the neck
      { const hp=org(W[2],new V3()), bt=sc.beat?Math.max(0,Math.sin(t/sc.beat*Math.PI))**3*.06:0; turnAbout(W[2],hp,QA.setFromEuler(new THREE.Euler(.32+bt,.22,0,'YXZ'))); }   // (the head looks down at the neck, nodding on a song's beat)
      left(sc,t,tgL,{f:0}); const strum=right(sc,t,tgR);
      // the wrists: the left under the neck at the hand's place, the right over the strings (riding the strum)
      const p=posAt(sc,t), yL=pressY(Math.max(1,Math.round(p))+1), wL=toG(new V3(.09,yL-.012,FB-.04),new V3());
      const yR=plY('m'), wr=strum?new V3(strum.x-.09,yR+.035,F.sad[1]+.075):new V3(-.1,yR+.035,F.sad[1]+.07), wR=toG(wr,new V3()), k=VA.setFromMatrixColumn(W[1],0).length();
      // (the wrists then move by what the fingertips still miss, a few rounds a frame, kept frame to frame: the hand goes where its fingers can reach)
      for(let i=0;i<15;i++)W0[i].copy(W[i]); const st=PMx.hands, E={L:new V3(),R:new V3()};
      for(let it=0;it<4;it++){ if(it)for(let i=0;i<15;i++)W[i].copy(W0[i]);
        reach(W,[3,4,5],VA.copy(wL).add(H.off.L),dirB(DIRS.Lpole)); reach(W,[6,7,8],VB.copy(wR).add(H.off.R),dirB(DIRS.Rpole));
        if(GHOLD.stage>=3){ aim(W,5,'L',dirG(DIRS.Lf,new V3()),dirG(DIRS.Ld,new V3())); aim(W,8,'R',dirG(DIRS.Rf,new V3()),dirG(DIRS.Rd,new V3())); }
        if(GHOLD.stage<4){ for(const sd of 'LR')for(let i=0;i<5;i++)fg[sd][i]=[0,0,0,HANDS.R0[i][3]]; break; }
        if(!st||!st.base)break; H.err={L:[],R:[]};
        for(const [side,bi,tg] of [['L',5,tgL],['R',8,tgR]]){ const base=MA.multiplyMatrices(W[bi],body.binv[bi]).multiply(st.base[side]), inv=MB.copy(base).invert(), f=fg[side], e=E[side].set(0,0,0); let wsum=0;
          for(let i=0;i<5;i++){ if(side==='R'&&i===4){ f[4]=[.9,1.2,.85,HANDS.R0[4][3]]; continue; } const tw=toG(tg[i],new V3()), v=VC.copy(tw).applyMatrix4(inv); HANDS.reach(i,v,f[i]);
            const tip=HANDS.tip(i,f[i],VD).applyMatrix4(base), w=i===0?.5:1; H.err[side][i]=tip.distanceTo(tw)/k; e.addScaledVector(tw.sub(tip),w); wsum+=w; }
          e.multiplyScalar(1/wsum); H.off[side].add(e); const mx=(side==='R'?.03:.09)*k; if(H.off[side].length()>mx)H.off[side].setLength(mx); } }
      if(st)st.fg=fg;
      for(let i=0;i<15;i++)P[i].multiplyMatrices(W[i],body.binv[i]); };
    return H; };
  GHOLD.detach=H=>{ if(!H)return; H.on=false; if(H.PM.post)H.PM.post=null; if(H.gm.parent)H.gm.parent.remove(H.gm); const st=H.PM.hands; if(st)st.fg=null; }; }
export {GHOLD};
