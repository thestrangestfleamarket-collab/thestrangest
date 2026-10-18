// THE RECORDED JUMP (owner, 18 Oct 2026; data/moves.json): his jump played through the rig as the page plays him (60 a second, st.world,
// footLock), standing and running: no NaN, when each foot leaves and touches, how high, how far apart his feet land, and that he ends at rest.
// node tests/jumpcheck.cjs [out.json for a picture]
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a0=H.indexOf('const RIG=(()=>{'), src=H.slice(a0,H.indexOf('\n})();',a0)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')(), SZ=1.2, K=30/SZ, dt=1/60, pics={};
for(const run of [0,1]){ const st=R.create(); st.snap=true; let z=0,t=0,lift={},land={},top=0,bad=0,fr=[],moved=0,last=null;
  st.target=run; st.runTarget=run; for(let i=0;i<60;i++){ t+=dt; const b=st.dist; R.step(st,dt); z+=(st.dist-b)*SZ/30; st.world={x:0,z,y:0,hd:0,kx:K,ky:K,gnd:()=>0,t}; R.pose(st,true); }
  R.begin(st,'jump'); const t0=t;
  for(let i=0;i<150;i++){ t+=dt; if(i==20) st.target=0, st.runTarget=0; const b=st.dist; R.step(st,dt); z+=(st.dist-b)*SZ/30; st.world=st.move?null:{x:0,z,y:0,hd:0,kx:K,ky:K,gnd:()=>0,t}; const B=R.pose(st,true);
    for(const k in B.J){ const p=B.J[k]; if(!isFinite(p.x+p.y+p.z)) bad++; }
    for(const n of 'LR'){ const y=B.J['ankle'+n].y; if(y>R.ANKLE+1.5&&lift[n]==null) lift[n]=+(t-t0).toFixed(2); if(lift[n]!=null&&land[n]==null&&y<R.ANKLE+0.6&&t-t0>lift[n]+0.1) land[n]={t:+(t-t0).toFixed(2),x:B.J['ankle'+n].x,z:B.J['ankle'+n].z+z*K}; }
    top=Math.max(top,B.J.pelvis.y); const s=JSON.stringify(B.J); if(i>130&&last&&s!==last) moved++; last=s; if(i%3==0) fr.push(Object.fromEntries(Object.entries(B.J).map(([k,v])=>[k,[v.x,v.y,v.z]]))); }
  const sep=land.L&&land.R?Math.hypot(land.L.x-land.R.x,land.L.z-land.R.z):null;
  console.log(run?'running jump:':'standing jump:','feet leave L',lift.L,'R',lift.R,'s | land L',land.L&&land.L.t,'R',land.R&&land.R.t,'s | hips up to',(top-R.STAND).toFixed(1),'units | feet apart on landing',sep&&sep.toFixed(1),'units (L ahead by',land.L&&land.R?((land.L.z-land.R.z)).toFixed(1):'-',') | NaN',bad,'| moving at the end',moved,'| still in the move',!!st.move);
  pics[run?'run':'stand']=fr; }
if(process.argv[2]) fs.writeFileSync(process.argv[2],JSON.stringify(pics));
