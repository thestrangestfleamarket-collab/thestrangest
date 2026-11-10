// MOTION CAPTURE ONTO THE WALKER (owner, 18 Oct 2026; his picks: CMU's library and Mixamo): a recording read by tools/mocap-read.py (each joint's
// place a frame, metres, y up) fitted to his rig with the rig's own conventions (lifted from dist/market.html): the pelvis's turn (yaw, roll,
// pitch), the spine's (bend, side, the chest's yaw), the head's nod, each upper arm and forearm (ua, fa), and each leg either as its ankle's
// place (ik: on the ground, so the rig's own leg solver plants it) or its thigh and shin (th, sh: in the air), the foot's tilt. Sized by his
// legs against the recording's. As a jump: its crouch, its flight and its landing found in the recording (the feet off the ground) and laid on
// the rig's own jump (jumpMove: its physics, its timing, its sliders), the crouch squeezed into t0, the flight as fractions of the air, the
// landing after. Prints how near his built joints come to the recording's.
// node tools/mocap-rig.cjs clip.json jump out.json [t0=0.24] [land=0.36]   (a climb: below)
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a0=H.indexOf('const RIG=(()=>{'), src=H.slice(a0,H.indexOf('\n})();',a0)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')();
const [inp,kind,out]=process.argv.slice(2), T0=+(process.argv[5]||0.24), TL=+(process.argv[6]||0.36);
const M=JSON.parse(fs.readFileSync(inp)), F=M.frames, fps=M.fps, D=Math.PI/180;
const v=a=>({x:a[0],y:a[1],z:a[2]}), sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}), add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}), mul=(a,k)=>({x:a.x*k,y:a.y*k,z:a.z*k}),
  dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z, cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}), len=a=>Math.sqrt(dot(a,a)), nrm=a=>mul(a,1/len(a));
// the move's frame: his left +x, up +y, ahead +z (the rig's); a jump's from the hips' line before he leaves the ground, a climb's from its hips' line on the ladder
const UP={x:0,y:1,z:0}; let L,FW,O,K,ank0,pre,tk,ld,post,TR=null;
const toM=p=>{ const d=sub(v(p),O); return {x:dot(d,L),y:p[1],z:dot(d,FW)}; };   // (in the move's frame, metres; y as recorded)
const P=p=>{ const q=toM(p); return TR?TR(q):{x:q.x*K,y:(q.y-ank0)*K+R.ANKLE,z:q.z*K}; };   // (his units, the ankles at rest at his ankle's height; TR: a climb's own)
if(kind==='jump'){
const ank=f=>Math.min(f.ankleL[1],f.ankleR[1]), gnd=Math.min(...F.map(ank));
tk=F.findIndex((f,i)=>i>2&&ank(f)>gnd+0.08); ld=tk; while(ld<F.length&&ank(F[ld])>gnd+0.05) ld++;
tk=Math.max(1,tk-1);   // (the last frame a foot touched)
pre=Math.max(0,tk-Math.round(0.5*fps)); post=Math.min(F.length-1,ld+Math.round(0.55*fps));
L={x:0,y:0,z:0}; for(let i=pre;i<=tk;i++) L=add(L,sub(v(F[i].hipL),v(F[i].hipR))); L.y=0; L=nrm(L);
FW=cross(L,UP); O=v(F[pre].pelvis);
// his size against the recording's: his legs against its (hip to knee to ankle, standing)
const f0=F[pre], legM=len(sub(v(f0.kneeL),v(f0.hipL)))+len(sub(v(f0.ankleL),v(f0.kneeL)));
K=(R.THIGH+R.SHIN)/legM; ank0=(f0.ankleL[1]+f0.ankleR[1])/2; }
// the rig's turns (its yaw, rotZ, rotX) and their inverse
const Y=(p,t)=>({x:p.x*Math.cos(t)+p.z*Math.sin(t),y:p.y,z:-p.x*Math.sin(t)+p.z*Math.cos(t)}), Zr=(p,t)=>({x:p.x*Math.cos(t)+p.y*Math.sin(t),y:-p.x*Math.sin(t)+p.y*Math.cos(t),z:p.z}),
  Xr=(p,t)=>({x:p.x,y:p.y*Math.cos(t)-p.z*Math.sin(t),z:p.y*Math.sin(t)+p.z*Math.cos(t)});
const turnOf=(xa,za)=>{ const yaw=Math.atan2(-xa.z,xa.x), roll=-Math.asin(Math.max(-1,Math.min(1,xa.y))), cb=za.x*Math.sin(yaw)+za.z*Math.cos(yaw), pitch=Math.atan2(-za.y/Math.cos(roll),cb); return {yaw,roll,pitch}; };
const unturn=(p,t)=>Xr(Zr(Y(p,-t.yaw),-t.roll),-t.pitch);   // (a world direction into the turned frame)
const frameOf=(xv,yv)=>{ const x=nrm(xv), z=nrm(cross(x,yv)), y=cross(z,x); return {x,y,z}; };
const limbOf=(d,s)=>{ const b=Math.asin(Math.max(-1,Math.min(1,s*d.x))); return [Math.atan2(d.z,-d.y)/D,b/D]; };   // (the rig's limb(a,b,s), backwards, in degrees)
const keyOf=(f,air)=>{ const J={}; for(const k in f) J[k]=P(f[k]);
  const Bf=frameOf(sub(J.hipL,J.hipR),sub(J.spine,J.pelvis)), tb=turnOf(Bf.x,Bf.z);
  const Uf=frameOf(sub(J.shoulderL,J.shoulderR),sub(J.neck,J.chest)), ux=unturn(Uf.x,tb), uz=unturn(Uf.z,tb), tu=turnOf(ux,uz);
  const inU=d=>unturn(unturn(d,tb),{yaw:0,roll:tu.roll,pitch:tu.pitch}), inB=d=>unturn(d,tb);
  const hd=inU(nrm(sub(J.head,J.neck)));
  const c={root:[0,+J.pelvis.y.toFixed(2),0],yaw:+(tb.yaw/D).toFixed(1),roll:+(tb.roll/D).toFixed(1),pitch:+(tb.pitch/D).toFixed(1),side:+(tu.roll/D).toFixed(1),bend:+(tu.pitch/D).toFixed(1),cyaw:+(tu.yaw/D).toFixed(1),nod:+(Math.atan2(hd.z,hd.y)/D-8).toFixed(1)};
  for(const [n,s] of [['L',1],['R',-1]]){ const g={};
    g.ua=limbOf(inU(nrm(sub(J['elbow'+n],J['shoulder'+n]))),s).map(x=>+x.toFixed(1)); g.fa=limbOf(inU(nrm(sub(J['wrist'+n],J['elbow'+n]))),s).map(x=>+x.toFixed(1));
    const ft=inB(nrm(sub(J['ball'+n],J['ankle'+n]))); g.foot=+(Math.atan2(ft.y,ft.z)/D+12).toFixed(1);   // (its tilt toe-up; the recording's foot sits 12 degrees toe-down at rest)
    g.th=limbOf(inB(nrm(sub(J['knee'+n],J['hip'+n]))),s).map(x=>+x.toFixed(1)); g.sh=limbOf(inB(nrm(sub(J['ankle'+n],J['knee'+n]))),s).map(x=>+x.toFixed(1));
    c[n]=g; }
  if(!air){ // on the ground: the legs as the recording turns them, his ankles where that puts them, his hips lowered or raised so the lower ankle is on the floor; then
    // the ankles handed to the rig's own leg solver (ik), so a key between keys keeps the feet planted
    const Pz=R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P, B=R.build(Pz,null).J, dy=R.ANKLE-Math.min(B.ankleL.y,B.ankleR.y);
    c.root[1]=+(c.root[1]+dy).toFixed(2); for(const n of 'LR'){ const A=B['ankle'+n]; c[n].ik=[A.x,A.y+dy,A.z].map(x=>+x.toFixed(2)); delete c[n].th; delete c[n].sh; } }
  return {c,J}; };
if(kind==='jump'){
// the jump: the crouch into t0, the flight at fractions of the air, the landing from 100
const keys=[[0,{}]], every=1;
const nPre=tk-pre; for(let i=pre+1;i<=tk;i+=every) keys.push([+(T0*(i-pre)/nPre).toFixed(3),keyOf(F[i],false).c]);
const nAir=ld-tk; for(let i=tk+1;i<ld;i+=every){ const c=keyOf(F[i],true).c; c.root[1]=R.STAND; keys.push(['u'+((i-tk)/nAir).toFixed(3),c]); }   // (in the air the rig's own arc lifts him: the recording's rise left out, his hips at standing height on it)
keys.push(['u1',keyOf(F[ld],false).c]);
const nPost=post-ld; for(let i=ld+1;i<=post;i+=every) keys.push([+(100+TL*(i-ld)/nPost).toFixed(3),keyOf(F[i],false).c]);
keys.push([+(100+TL+0.12).toFixed(3),{root:[0,R.STAND,0],yaw:0,roll:0,pitch:0,side:0,bend:0,cyaw:0,nod:0,L:{ua:[9,8],fa:[19,8],foot:0,ik:[R.FOOTX,R.ANKLE,0]},R:{ua:[9,8],fa:[19,8],foot:0,ik:[-R.FOOTX,R.ANKLE,0]}}]);
// how near: each key built by the rig against the recording, his units (he's 52 tall)
let err=0,n=0,worst=0; for(const i of [pre,Math.round((pre+tk)/2),tk,Math.round((tk+ld)/2),ld,post]){ const {c,J}=keyOf(F[i],i>tk&&i<ld); const Pz=R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P, B=R.build(Pz,null).J;
  for(const k of ['head','chest','kneeL','kneeR','ankleL','ankleR','elbowL','elbowR','wristL','wristR']){ const e=len(sub(sub(B[k],B.pelvis),sub(J[k],J.pelvis))); err+=e; n++; worst=Math.max(worst,e); } }
console.log(M.src,'frames',F.length,'| crouch',pre,'-',tk,'air',tk,'-',ld,'land',ld,'-',post,'| size x',K.toFixed(1),'| fit: mean',(err/n).toFixed(2),'worst',worst.toFixed(2),'of his units (52 tall)','|',keys.length,'keys');
fs.writeFileSync(out,JSON.stringify({src:M.src,t0:T0,keys}));
if(process.env.DIAG){ const i=+process.env.DIAG; const air=i>tk&&i<ld, {c,J}=keyOf(F[i],air); const Pz=R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P, B=R.build(Pz,null).J;
  const dir=(S,a,b)=>nrm(sub(S[b],S[a])); console.log('frame',i,air?'air':'ground',JSON.stringify(c));
  for(const [a,b] of [['pelvis','chest'],['chest','head'],['hipL','kneeL'],['kneeL','ankleL'],['hipR','kneeR'],['kneeR','ankleR'],['shoulderL','elbowL'],['elbowL','wristL'],['shoulderR','elbowR'],['elbowR','wristR'],['hipR','hipL'],['shoulderR','shoulderL']]){
    const r=dir(B,a,b), m=dir(J,a,b); console.log((a+'>'+b).padEnd(20),'angle off',(Math.acos(Math.max(-1,Math.min(1,dot(r,m))))/D).toFixed(0).padStart(4),'deg  rig',[r.x,r.y,r.z].map(x=>x.toFixed(2)).join(','),' rec',[m.x,m.y,m.z].map(x=>x.toFixed(2)).join(',')); } } }
// A CLIMB (owner, 8 Nov 2026: "lets redo the climbing animation, based it on real climbing animations"; his pick CMU): one cycle up a ladder.
// Half a cycle is where the pose comes back as its own mirror a rung higher; the other half is that half mirrored, the seams eased so it loops;
// 12 keys a second (the first half only), the steady rise taken out (the page lifts him), the limbs as thigh and shin (the holds plant them); and for each hand and foot
// its reach: when in the cycle it lets go and takes hold (t0, t1), how high it is then (lo, hi, over his feet's level) and how far out and ahead (x, z).
// node tools/mocap-rig.cjs clip.json climb data/moves.json [start s] [half s]   (without start and half the best half is searched for)
if(kind==='climb'){
  const n=F.length, sw=k=>k.replace(/[LR]$/,m=>m=='L'?'R':'L');
  L={x:0,y:0,z:0}; for(const f of F) L=add(L,sub(v(f.hipL),v(f.hipR))); L.y=0; L=nrm(L); FW=cross(L,UP);
  const mir=(f,o)=>{ const g={}; for(const k in f){ const p=v(f[k]), q=sub(p,mul(L,2*dot(sub(p,o),L))); g[sw(k)]=[q.x,q.y,q.z]; } return g; };
  const rel=(f,k)=>sub(v(f[k]),v(f.pelvis)), err=(a,b)=>{ let e=0,m=0; for(const k in a){ e+=len(sub(rel(a,k),rel(b,k))); m++; } return e/m; };
  let i0=Math.round((+process.argv[5]||0)*fps), H=Math.round((+process.argv[6]||0)*fps), best=null;
  if(!H) for(let i=0;i<n;i++) for(let h=Math.round(.4*fps);h<1.4*fps&&i+h<n;h++){ if(F[i+h].pelvis[1]-F[i].pelvis[1]<0.2) continue; const e=err(F[i+h],mir(F[i],v(F[i].pelvis))); if(best==null||e<best){ best=e; i0=i; H=h; } }
  const at=x=>{ const i=Math.min(n-2,Math.floor(x)), t=x-i, f={}; for(const k in F[i]) f[k]=F[i][k].map((a,j)=>a+(F[i+1][k][j]-a)*t); return f; };
  // the way he climbs (up the ladder's slope) turned to straight up, as on a trunk, and taken out: the hips' mean at his standing height less one
  const T=sub(v(F[i0+H].pelvis),v(F[i0].pelvis)), Tz=dot(T,FW), Ty=T.y, Tl=Math.hypot(Tz,Ty), ca=Ty/Tl, sa=Tz/Tl;
  O={x:0,y:0,z:0}; let leg=0, zm=0, ym=0, tc=0; for(let i=i0;i<=i0+H;i++){ O=add(O,mul(v(F[i].pelvis),1/(H+1))); leg+=(len(sub(v(F[i].kneeL),v(F[i].hipL)))+len(sub(v(F[i].ankleL),v(F[i].kneeL))))/(H+1); }
  const turn=(q,t)=>{ const rz=q.z-(t-.5)*Tz, ry=q.y-O.y-(t-.5)*Ty; return {x:q.x,y:rz*sa+ry*ca,z:rz*ca-ry*sa}; };
  for(let i=i0;i<=i0+H;i++){ const r=turn(toM(F[i].pelvis),(i-i0)/H); zm+=r.z/(H+1); ym+=r.y/(H+1); }
  K=(R.THIGH+R.SHIN)/leg; const rise=2*Tl*K, NH=Math.round(H/fps*12);
  TR=q=>{ const r=turn(q,tc); return {x:q.x*K,y:(r.y-ym)*K+R.STAND-1,z:(r.z-zm)*K}; };
  const half=(t,m)=>{ const f=at(i0+t*H); tc=t; const {c,J}=keyOf(m?mir(f,O):f,true); c.root=[J.pelvis.x,J.pelvis.y,J.pelvis.z]; return {c,J}; };
  const A=[], B=[]; for(let j=0;j<=NH;j++){ A.push(half(j/NH,false).c); B.push(half(j/NH,true).c); }
  const ease=(a,b,c,w)=>Array.isArray(a)?a.map((x,i)=>ease(x,b[i],c[i],w)):typeof a=='object'?Object.fromEntries(Object.keys(a).map(k=>[k,ease(a[k],b[k],c[k],w)])):a+(c-b)*w;
  const keys=[]; for(let j=0;j<NH;j++) keys.push(ease(A[j],A[NH],B[0],j/NH));   // (eased into the mirror of its start; only this half is kept: the rig mirrors it for the other, which then eases back into the start)
  for(let j=0;j<keys.length;j++){ const r=keys[j].root.map(x=>+x.toFixed(2)); keys[j]=JSON.parse(JSON.stringify(keys[j],(k,x)=>typeof x=='number'?+x.toFixed(1):x)); keys[j].root=r; }
  // the reaches: a joint's height plus the cycle's rise so far is flat while it holds and climbs while it reaches; its fastest climb, out to where it slows
  const S=96, J=[]; for(let j=0;j<S;j++){ const u=j/S, {c}=half(u<.5?2*u:2*u-1,u>=.5); J.push(R.build(R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P,null).J); }   // (his own limbs, as the rig builds them)
  const reach={}; for(const [k,j] of [['hL','wristL'],['hR','wristR'],['fL','ankleL'],['fR','ankleR']]){ const w=J.map((q,i)=>q[j].y+rise*i/S), s=w.map((x,i)=>(i<S-1?w[i+1]-x:w[0]+rise-x)*S);
    let m=0; for(let i=1;i<S;i++) if(s[i]>s[m]) m=i; let a=m, b=m; while(s[(a-1+S)%S]>.25*rise&&(a-1+S)%S!==m) a=(a-1+S)%S; while(s[(b+1)%S]>.25*rise&&(b+1)%S!==m) b=(b+1)%S; b=(b+1)%S;
    reach[k]={x:+(J.reduce((t,q)=>t+q[j].x,0)/S).toFixed(1),z:+(J.reduce((t,q)=>t+q[j].z,0)/S).toFixed(1),t0:+(a/S).toFixed(3),t1:+(b/S).toFixed(3),lo:+J[a][j].y.toFixed(1),hi:+J[b][j].y.toFixed(1)}; }
  let e=0,m=0,worst=0; for(let j=0;j<=NH;j+=Math.max(1,NH>>2)){ const {c,J:Jr}=half(j/NH,false), Pz=R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P, Bj=R.build(Pz,null).J;
    for(const k of ['head','chest','kneeL','kneeR','ankleL','ankleR','elbowL','elbowR','wristL','wristR']){ const d=len(sub(sub(Bj[k],Bj.pelvis),sub(Jr[k],Jr.pelvis))); e+=d; m++; worst=Math.max(worst,d); } }
  const sj=(M.src.match(/(\d+)_(\d+)/)||[]).slice(1).map(Number), C={src:'CMU Graphics Lab Motion Capture Database, subject '+sj[0]+' trial '+sj[1]+' (climb ladder), mocap.cs.cmu.edu',rise:+rise.toFixed(2),at:reach,keys};
  console.log(M.src,'half cycle from',(i0/fps).toFixed(2),'s for',(H/fps).toFixed(2),'s'+(best!=null?' (mirror off by '+(best*100).toFixed(1)+' cm)':''),'| the ladder',(Math.atan2(Tz,Ty)/D).toFixed(0),'deg off upright | rise a cycle',rise.toFixed(1),'units | size x',K.toFixed(1),'| fit: mean',(e/m).toFixed(2),'worst',worst.toFixed(2),'|',keys.length,'keys');
  for(const k in reach) console.log(' ',k,JSON.stringify(reach[k]));
  if(process.env.DIAG){ const {c,J:Jr}=half(+process.env.DIAG,false), Bj=R.build(R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P,null).J, dir=(Q,a,b)=>nrm(sub(Q[b],Q[a])); console.log(JSON.stringify(c));
    for(const [a,b] of [['pelvis','chest'],['chest','head'],['hipL','kneeL'],['kneeL','ankleL'],['hipR','kneeR'],['kneeR','ankleR'],['shoulderL','elbowL'],['elbowL','wristL'],['shoulderR','elbowR'],['elbowR','wristR'],['hipR','hipL'],['shoulderR','shoulderL']]){
      const r=dir(Bj,a,b), q=dir(Jr,a,b); console.log((a+'>'+b).padEnd(20),'angle off',(Math.acos(Math.max(-1,Math.min(1,dot(r,q))))/D).toFixed(0).padStart(4),'deg  rig',[r.x,r.y,r.z].map(x=>x.toFixed(2)).join(','),' rec',[q.x,q.y,q.z].map(x=>x.toFixed(2)).join(',')); } }
  const all=fs.existsSync(out)?JSON.parse(fs.readFileSync(out)):{}; all.climb=C; fs.writeFileSync(out,JSON.stringify(all)); console.log(out,JSON.stringify(all).length,'bytes, the climb',JSON.stringify(C).length); }
