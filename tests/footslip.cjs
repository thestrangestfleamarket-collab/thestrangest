// HIS FEET PLANTED (owner, 18 Oct 2026): the rig lifted out of dist/market.html and stepped at its own 120 a second, no drawing; while each foot
// is in its stance, how fast the part of it on the ground (heel, ball or toe, the lowest) moves over the ground, in his units a second (drawn
// W3.SZ, 1.2, as the world carries him). A planted foot: about 0. node tests/footslip.cjs   (ANIM=2: the avatar editor's ANIMATION speed)
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a=H.indexOf('const RIG=(()=>{'), src=H.slice(a,H.indexOf('\n})();',a)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')(), SZ=1.2, h=1/120;
for(const run of [0,1]){ const st=R.create(); st.target=1; st.w=1; st.run=st.runTarget=run; st.anim=+process.env.ANIM||1; let prev=null,d0=0,t=0; const sl={L:0,R:0},n={L:0,R:0};
  for(let i=0;i<120*6;i++){ R.step(st,h); const B=R.pose(st,true), ST=R.gaitOf(st.run).stance, q={L:(st.ph+.25)%1,R:(st.ph+.75)%1};
    if(i>240){ t+=h; for(const s of 'LR') if(prev&&q[s]>.02&&q[s]<ST-.02&&prev.q[s]<q[s]){ const k=['heel','ball','toe'].reduce((m,k)=>B.J[k+s].y<B.J[m+s].y?k:m,'heel'); sl[s]+=SZ*((st.dist-prev.d)+(B.J[k+s].z-prev.J[k+s].z)); n[s]++; } }
    prev={J:JSON.parse(JSON.stringify(B.J)),d:st.dist,q}; if(i===240)d0=st.dist; }
  const g=R.gaitOf(run); console.log((run?'run ':'walk')+': pace',(SZ*(st.dist-d0)/t).toFixed(1),'| a planted foot slides',(sl.L/(n.L*h)).toFixed(2),(sl.R/(n.R*h)).toFixed(2),'| steps a minute',Math.round(120/g.cycle)); }
