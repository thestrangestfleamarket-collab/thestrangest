// THE LEAN INTO A TURN AND THE STOP'S WEIGHT SHIFT (owner, 18 Oct 2026), the rig alone (lifted from dist/market.html, stepped at its 120 a second):
// walking and running round a steady turn, how far he leans and whether the foot on the ground stays put; let go, how his chest and hips move
// over the next second and that after it nothing moves. node tests/turnstop.cjs
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a=H.indexOf('const RIG=(()=>{'), src=H.slice(a,H.indexOf('\n})();',a)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')(), h=1/120, D=Math.PI/180;
for(const run of [0,1]) for(const yr of [0,1.5,-1.5]){ const st=R.create(); st.snap=true; st.target=1; st.w=1; st.run=st.runTarget=run; st.yr=yr; let sl=0,n=0,prev=null;
  for(let i=0;i<240;i++){ R.step(st,h); const B=R.pose(st,true), ST=R.gaitOf(run).stance, q=(st.ph+.25)%1;
    if(i>120&&prev&&q>.02&&q<ST-.02&&prev.q<q){ const k=['heel','ball','toe'].reduce((m,k)=>B.J[k+'L'].y<B.J[m+'L'].y?k:m,'heel'); sl+=Math.abs((st.dist-prev.d)+(B.J[k+'L'].z-prev.J[k+'L'].z))+Math.abs(B.J[k+'L'].x-prev.J[k+'L'].x); n++; }
    prev={J:JSON.parse(JSON.stringify(B.J)),d:st.dist,q}; }
  const B=R.pose(st,true); console.log((run?'run ':'walk')+' turn '+yr+' rad/s: lean',(st.bank/D).toFixed(1),'deg | head over the hips',(B.J.head.x-B.J.pelvis.x).toFixed(2),'| planted foot moves',(sl/(n*h)).toFixed(2),'a second'); }
for(const run of [0,1]){ const st=R.create(); st.snap=true; st.target=1; st.w=1; st.run=st.runTarget=run; for(let i=0;i<240;i++)R.step(st,h); st.target=0; st.runTarget=0; const row=[]; let last=null,moved=0;
  for(let i=0;i<180;i++){ R.step(st,h); const B=R.pose(st,true), s=JSON.stringify(B.J); if(i%12==0)row.push(`${(i*h).toFixed(1)}s chest z ${B.J.chest.z.toFixed(2)} hips y ${B.J.pelvis.y.toFixed(2)}`); if(i*h>1&&last&&s!==last)moved++; last=s; }
  console.log((run?'run':'walk')+' let go:\n  '+row.join('\n  ')+'\n  frames changed after 1 s: '+moved+' | stop over: '+!st.stop); }
