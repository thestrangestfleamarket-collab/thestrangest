// HIS WALK AND RUN FROM MOTION CAPTURE (owner, 19 Oct 2026: "make sure he has a natural gait and run, like tomb raider or prince of persia"):
// one cycle of a CMU walk and one of a run (subject 35, trials 01 and 17), from one left heel-strike to the next, each fitted to his rig at 32
// points of the cycle with tools/mocap-rig.cjs's fit (the pelvis's turns, the spine's, the head's nod, each arm, each leg's thigh and shin),
// in a frame that travels with him (his hips' place each frame; ahead the way the recording goes). -> data/gait.json {walk,run: {st, keys}}.
// python3 tools/mocap-read.py 35.asf 35_01.amc walk.json 1 ; ... 35_17.amc run.json 1 ; MIN=0 python3 build.py ; node tools/gait-bake.cjs walk.json run.json
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a0=H.indexOf('const RIG=(()=>{'), src=H.slice(a0,H.indexOf('\n})();',a0)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')();
const [wIn,rIn]=process.argv.slice(2), N=32, D=Math.PI/180;
const v=a=>({x:a[0],y:a[1],z:a[2]}), sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}), add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}), mul=(a,k)=>({x:a.x*k,y:a.y*k,z:a.z*k}),
  dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z, cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}), len=a=>Math.sqrt(dot(a,a)), nrm=a=>mul(a,1/len(a));
let L, FW, O, K, ank0; const UP={x:0,y:1,z:0};
const toM=p=>{ const d=sub(v(p),O); return {x:dot(d,L),y:p[1],z:dot(d,FW)}; };
const P=p=>{ const q=toM(p); return {x:q.x*K,y:(q.y-ank0)*K+R.ANKLE,z:q.z*K}; };
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
const cycle=inp=>{ const M=JSON.parse(fs.readFileSync(inp)), F=M.frames, n=F.length;
  const d=sub(v(F[n-1].pelvis),v(F[0].pelvis)); d.y=0; FW=nrm(d); L=cross(UP,FW);
  K=(R.THIGH+R.SHIN)/(F.reduce((s,f)=>s+len(sub(v(f.kneeL),v(f.hipL)))+len(sub(v(f.ankleL),v(f.kneeL))),0)/n); ank0=Math.min(...F.map(f=>Math.min(f.ankleL[1],f.ankleR[1])));
  const hy=(f,s)=>F[f]['ankle'+s][1]-ank0;
  const strikes=s=>{ const o=[]; let up=false; for(let f=1;f<n;f++){ const y=hy(f,s); if(y>0.12) up=true; else if(up&&y<0.03){ o.push(f); up=false; } } return o; };
  const sL=strikes('L'), sR=strikes('R'), a=sL[0], b=sL[1];
  if(b==null) throw new Error(inp+': no full cycle (strikes '+sL+')');
  let off=a; while(off<b&&hy(off,'L')<0.045) off++; const st=(off-a)/(b-a);
  const at=(u)=>{ const x=a+u*(b-a), i=Math.floor(x), t=x-i, f0=F[i], f1=F[Math.min(n-1,i+1)], f={}; for(const k in f0) f[k]=f0[k].map((v0,j)=>v0+(f1[k][j]-v0)*t); return f; };
  const keys=[]; for(let i=0;i<N;i++){ const f=at(i/N); O=v(f.pelvis); O.y=0; O={x:O.x,y:0,z:O.z}; const {c}=keyOf(f,true); keys.push(c); }
  const rs=sR.find(x=>x>a); console.log(M.src,'cycle',a,'-',b,'frames ('+((b-a)/M.fps).toFixed(2)+' s), left stance',(st*100).toFixed(0)+'%, right strike at',((rs-a)/(b-a)).toFixed(2),'| size x',K.toFixed(1));
  return {st:+st.toFixed(3),keys}; };
const G={walk:cycle(wIn),run:cycle(rIn)};
fs.writeFileSync(__dirname+'/../data/gait.json',JSON.stringify(G)); console.log('data/gait.json',JSON.stringify(G).length,'bytes');
