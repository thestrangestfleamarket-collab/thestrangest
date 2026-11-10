// RECORDINGS ONTO THE WALKER AS MOVES: recordings in tools/mocap-read.py's format (each joint's place a frame; Mesh2Motion's human clips through
// tools/m2m-human.cjs) fitted to his rig with tools/mocap-rig.cjs's fit (lifted here; the rig read out of dist/market.html, MIN=0 build first), a key
// every 1/fps s: a foot on the ground handed to the rig's leg solver (ik), one in the air as its thigh and shin. In place: his hips stay over the start.
// -> data/moves2.json {name:{src,dur,loop,keys}} (fetched when first used). node tools/m2m-moves.cjs <recordings dir> <spec.json> [fps=10]
// spec: {"move name":{"clip":"greeting","from":0,"to":1.2,"loop":false}, ...}
const fs=require('fs'), path=require('path'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a0=H.indexOf('const RIG=(()=>{'), src=H.slice(a0,H.indexOf('\n})();',a0)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')();
const MAIN=require.main===module, [DIR,SPEC,FPSA='10']=MAIN?process.argv.slice(2):[], KF=+FPSA, D=Math.PI/180;
const v=a=>({x:a[0],y:a[1],z:a[2]}), sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}), add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}), mul=(a,k)=>({x:a.x*k,y:a.y*k,z:a.z*k}),
  dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z, cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}), len=a=>Math.sqrt(dot(a,a)), nrm=a=>mul(a,1/len(a));
const Y=(p,t)=>({x:p.x*Math.cos(t)+p.z*Math.sin(t),y:p.y,z:-p.x*Math.sin(t)+p.z*Math.cos(t)}), Zr=(p,t)=>({x:p.x*Math.cos(t)+p.y*Math.sin(t),y:-p.x*Math.sin(t)+p.y*Math.cos(t),z:p.z}),
  Xr=(p,t)=>({x:p.x,y:p.y*Math.cos(t)-p.z*Math.sin(t),z:p.y*Math.sin(t)+p.z*Math.cos(t)});
const turnOf=(xa,za)=>{ const yaw=Math.atan2(-xa.z,xa.x), roll=-Math.asin(Math.max(-1,Math.min(1,xa.y))), cb=za.x*Math.sin(yaw)+za.z*Math.cos(yaw), pitch=Math.atan2(-za.y/Math.cos(roll),cb); return {yaw,roll,pitch}; };
const unturn=(p,t)=>Xr(Zr(Y(p,-t.yaw),-t.roll),-t.pitch);
const frameOf=(xv,yv)=>{ const x=nrm(xv), z=nrm(cross(x,yv)), y=cross(z,x); return {x,y,z}; };
const limbOf=(d,s)=>{ const b=Math.asin(Math.max(-1,Math.min(1,s*d.x))); return [Math.atan2(d.z,-d.y)/D,b/D]; };
const r1=x=>Math.round(x), r2=x=>+x.toFixed(1);
const fit=(M,o)=>{ const F=M.frames, fps=M.fps, i0=Math.round((o.from||0)*fps), i1=Math.min(F.length-1,o.to!=null?Math.round(o.to*fps):F.length-1);
  // the move's frame: his left +x, up +y, ahead +z, from the hips' line at the start; sized by his legs against the recording's
  for(const f of F)delete f.__err; const f0=F[i0], L0=sub(v(f0.hipL),v(f0.hipR)); L0.y=0; const L=nrm(L0), UP={x:0,y:1,z:0}, FW=cross(L,UP), O=v(f0.pelvis);
  const legM=len(sub(v(f0.kneeL),v(f0.hipL)))+len(sub(v(f0.ankleL),v(f0.kneeL))), K=(R.THIGH+R.SHIN)/legM;
  const ank0=Math.min(...F.slice(i0,i1+1).map(f=>Math.min(f.ankleL[1],f.ankleR[1])));
  const P=p=>{ const d=sub(v(p),O); return {x:dot(d,L)*K,y:(p[1]-ank0)*K+R.ANKLE,z:dot(d,FW)*K}; };
  const keyOf=f=>{ const J={}; for(const k in f) if(k!=='__err')J[k]=P(f[k]);
    const Bf=frameOf(sub(J.hipL,J.hipR),sub(J.spine,J.pelvis)), tb=turnOf(Bf.x,Bf.z);
    const Uf=frameOf(sub(J.shoulderL,J.shoulderR),sub(J.neck,J.chest)), tu=turnOf(unturn(Uf.x,tb),unturn(Uf.z,tb));
    const inU=d=>unturn(unturn(d,tb),{yaw:0,roll:tu.roll,pitch:tu.pitch}), inB=d=>unturn(d,tb), hd=inU(nrm(sub(J.head,J.neck)));
    const c={root:[r2(J.pelvis.x),r2(J.pelvis.y),r2(J.pelvis.z)],yaw:r1(tb.yaw/D),roll:r1(tb.roll/D),pitch:r1(tb.pitch/D),side:r1(tu.roll/D),bend:r1(tu.pitch/D),cyaw:r1(tu.yaw/D),nod:r1(Math.atan2(hd.z,hd.y)/D-8)};
    if(!o.travel){ c.root[0]=0; c.root[2]=0; }
    for(const [n,s] of [['L',1],['R',-1]]){ const g={};
      g.ua=limbOf(inU(nrm(sub(J['elbow'+n],J['shoulder'+n]))),s).map(r1); g.fa=limbOf(inU(nrm(sub(J['wrist'+n],J['elbow'+n]))),s).map(r1);
      const ft=inB(nrm(sub(J['ball'+n],J['ankle'+n]))); g.foot=r1(Math.atan2(ft.y,ft.z)/D+12);
      g.th=limbOf(inB(nrm(sub(J['knee'+n],J['hip'+n]))),s).map(r1); g.sh=limbOf(inB(nrm(sub(J['ankle'+n],J['knee'+n]))),s).map(r1); c[n]=g; }
    // a foot on the ground: its ankle where the leg puts it, handed to the leg solver (ik) with the recording's knee as its pole (kp), the hips moved so the lower planted ankle is on the floor
    const down=n=>J['ankle'+n].y<R.ANKLE+3;
    const Pz=R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P, B=R.build(Pz,null).J, gl=['L','R'].filter(down);
    if(gl.length){ const dy=R.ANKLE-Math.min(...gl.map(n=>B['ankle'+n].y)); c.root[1]=r2(c.root[1]+dy); for(const n of gl){ const A=B['ankle'+n], k=inB(nrm(sub(J['knee'+n],J['hip'+n]))); c[n].ik=[A.x,A.y+dy,A.z].map(r2); c[n].kp={x:r2(k.x),y:r2(k.y),z:r2(k.z)}; delete c[n].th; delete c[n].sh; } }
    if(f===F[i0]||f.__err){ const B2=R.build(R.mkMove({keys:[[0,{}],[0.1,c,'lin']]}).k.slice(-1)[0].P,null).J; for(const [x,y] of [['pelvis','chest'],['chest','head'],['hipL','kneeL'],['kneeL','ankleL'],['hipR','kneeR'],['kneeR','ankleR'],['shoulderL','elbowL'],['elbowL','wristL'],['shoulderR','elbowR'],['elbowR','wristR']]){ const e=Math.acos(Math.max(-1,Math.min(1,dot(nrm(sub(B2[y],B2[x])),nrm(sub(J[y],J[x]))))))/D; if(process.env.DIAG)console.log('   ',(x+'>'+y).padEnd(18),e.toFixed(0)); ER.s+=e; ER.n++; ER.w=Math.max(ER.w,e); } }
    return c; };
  const ER={s:0,n:0,w:0}; for(let i=i0;i<=i1;i+=Math.max(1,Math.round((i1-i0)/6)))F[i].__err=1;
  const keys=[], dur=(i1-i0)/fps, step=Math.max(1,Math.round(fps/(o.kf||KF)));
  for(let i=i0;i<=i1;i+=step) keys.push([+((i-i0)/fps).toFixed(3),keyOf(F[i]),'lin']);
  if((i1-i0)%step) keys.push([+dur.toFixed(3),keyOf(F[i1]),'lin']);
  if(!o.quiet)console.log('  fit: bones off by',(ER.s/ER.n).toFixed(0),'deg on average, worst',ER.w.toFixed(0)); return {src:M.src,dur:+dur.toFixed(3),loop:!!o.loop,keys,...(o.drift?{opts:{...(o.opts||{}),drift:+(o.drift*K).toFixed(2)}}:{})}; };   // drift: an in-place recording's glide (m/s along the facing, e.g. the moonwalk's sliding foot), as rig units a second
module.exports={fit,R};   // (tools/dances-bake.cjs fits its recordings the same way)
if(MAIN){ const SPECS=JSON.parse(fs.readFileSync(SPEC));
const OUT=path.join(__dirname,'../data/moves2.json'), all={};   // (the spec is the whole list)
for(const [name,o] of Object.entries(SPECS)){ const M=JSON.parse(fs.readFileSync(path.join(DIR,o.clip+'.json'))); all[name]={...(o.opts?{opts:o.opts}:{}),...fit(M,o)}; console.log(name,'<-',o.clip,all[name].dur+'s',all[name].keys.length,'keys',JSON.stringify(all[name]).length,'bytes'); }
fs.writeFileSync(OUT,JSON.stringify(all)); console.log(OUT,fs.statSync(OUT).size,'bytes,',Object.keys(all).length,'moves'); }
