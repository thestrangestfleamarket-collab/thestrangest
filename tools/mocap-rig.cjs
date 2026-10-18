// MOTION CAPTURE ONTO THE WALKER (owner, 18 Oct 2026; his picks: CMU's library and Mixamo): a recording read by tools/mocap-read.py (each joint's
// place a frame, metres, y up) fitted to his rig with the rig's own conventions (lifted from dist/market.html): the pelvis's turn (yaw, roll,
// pitch), the spine's (bend, side, the chest's yaw), the head's nod, each upper arm and forearm (ua, fa), and each leg either as its ankle's
// place (ik: on the ground, so the rig's own leg solver plants it) or its thigh and shin (th, sh: in the air), the foot's tilt. Sized by his
// legs against the recording's. As a jump: its crouch, its flight and its landing found in the recording (the feet off the ground) and laid on
// the rig's own jump (jumpMove: its physics, its timing, its sliders), the crouch squeezed into t0, the flight as fractions of the air, the
// landing after. Prints how near his built joints come to the recording's.
// node tools/mocap-rig.cjs clip.json jump out.json [t0=0.24] [land=0.36]
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a0=H.indexOf('const RIG=(()=>{'), src=H.slice(a0,H.indexOf('\n})();',a0)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')();
const [inp,kind,out]=process.argv.slice(2), T0=+(process.argv[5]||0.24), TL=+(process.argv[6]||0.36);
const M=JSON.parse(fs.readFileSync(inp)), F=M.frames, fps=M.fps, D=Math.PI/180;
const v=a=>({x:a[0],y:a[1],z:a[2]}), sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}), add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}), mul=(a,k)=>({x:a.x*k,y:a.y*k,z:a.z*k}),
  dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z, cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}), len=a=>Math.sqrt(dot(a,a)), nrm=a=>mul(a,1/len(a));
// the move's frame: his left +x, up +y, ahead +z (the rig's), from the hips' line before he leaves the ground
const ank=f=>Math.min(f.ankleL[1],f.ankleR[1]), gnd=Math.min(...F.map(ank));
let tk=F.findIndex((f,i)=>i>2&&ank(f)>gnd+0.08), ld=tk; while(ld<F.length&&ank(F[ld])>gnd+0.05) ld++;
tk=Math.max(1,tk-1);   // (the last frame a foot touched)
const pre=Math.max(0,tk-Math.round(0.5*fps)), post=Math.min(F.length-1,ld+Math.round(0.55*fps));
let L={x:0,y:0,z:0}; for(let i=pre;i<=tk;i++) L=add(L,sub(v(F[i].hipL),v(F[i].hipR))); L.y=0; L=nrm(L);
const UP={x:0,y:1,z:0}, FW=cross(L,UP), O=v(F[pre].pelvis);
const toM=p=>{ const d=sub(v(p),O); return {x:dot(d,L),y:p[1],z:dot(d,FW)}; };   // (in the move's frame, metres; y as recorded)
// his size against the recording's: his legs against its (hip to knee to ankle, standing)
const f0=F[pre], legM=len(sub(v(f0.kneeL),v(f0.hipL)))+len(sub(v(f0.ankleL),v(f0.kneeL)));
const K=(R.THIGH+R.SHIN)/legM, ank0=(f0.ankleL[1]+f0.ankleR[1])/2;
const P=p=>{ const q=toM(p); return {x:q.x*K,y:(q.y-ank0)*K+R.ANKLE,z:q.z*K}; };   // (his units, the ankles at rest at his ankle's height)
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
    const r=dir(B,a,b), m=dir(J,a,b); console.log((a+'>'+b).padEnd(20),'angle off',(Math.acos(Math.max(-1,Math.min(1,dot(r,m))))/D).toFixed(0).padStart(4),'deg  rig',[r.x,r.y,r.z].map(x=>x.toFixed(2)).join(','),' rec',[m.x,m.y,m.z].map(x=>x.toFixed(2)).join(',')); } }
