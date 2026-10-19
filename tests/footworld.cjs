// HIS FEET IN THE WORLD (owner, 18 Oct 2026: world-space foot locking): the rig lifted from dist/market.html and played as the page plays him
// (60 frames a second: step, carried his distance x W3.SZ along his heading, his floor eased to the ground, st.world set, posed), through
// a straight walk, a circle, a sharp quarter turn, a stop, a start and a flight of steps. While a foot is on the ground (locked), how far it
// moves in the world a second (the least of heel, ball and toe: a rolling foot keeps one still); the stop's settling steps; the hips' drops.
// node tests/footworld.cjs
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a=H.indexOf('const RIG=(()=>{'), src=H.slice(a,H.indexOf('\n})();',a)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')(), SZ=1.2, PPU=30, K=PPU/SZ, dt=1/60;
function run(name,{gnd=()=>0,plan}){ const st=R.create(); st.snap=true; st.smooth=process.env.STEPPED!=="1"; const pos={x:0,z:0}; let hd=0,py=gnd(0,0),t=0,prev=null,slide=0,on=0,maxv=0,steps=0,lastStep=null,gap=0,gn=0,gmax=0;
  for(let f=0;f<60*plan.T;f++){ t+=f?dt:0; const c=plan.at(t); st.target=c.go?1:0; st.runTarget=c.run?1:0;
    let yr=0; if(c.go&&c.hd!=null){ let dh=Math.atan2(Math.sin(c.hd-hd),Math.cos(c.hd-hd)); const tn=3*Math.PI*dt; const dd=Math.max(-tn,Math.min(tn,dh)); hd+=dd; yr=dd/dt; } st.yr=yr;
    const b=st.dist; R.step(st,dt); const go=(st.dist-b)*SZ/PPU; pos.x+=Math.sin(hd)*go; pos.z+=Math.cos(hd)*go;
    let g=gnd(pos.x,pos.z); if(st.fk)for(const n of 'LR'){ const q=st.fk[n]; if(q&&q.on&&Math.hypot(q.x-pos.x,q.z-pos.z)<1)g=Math.min(g,q.y); } py+=(g-py)*Math.min(1,dt*20);
    st.world={x:pos.x,z:pos.z,y:py,hd,kx:K,ky:K,gnd,t}; const B=R.pose(st,true), cs=Math.cos(hd), sn=Math.sin(hd);
    const W=p=>({x:pos.x+(p.x*cs+p.z*sn)/K,z:pos.z+(-p.x*sn+p.z*cs)/K}), cur={};
    for(const n of 'LR'){ cur[n]={lock:st.fk&&st.fk[n],on:st.fk&&st.fk[n]&&st.fk[n].on&&!(st.fstep&&st.fstep.n==n),P:['heel','ball','toe'].map(k=>W(B.J[k+n]))}; }
    for(const n of 'LR') if(cur[n].on&&t>0.5){ const lo=Math.min(...['heel','ball','toe'].map(k=>B.J[k+n].y)), wp=W(B.J['ball'+n]), gp=(py+lo/K)-Math.max(...['heel','ball','toe'].map(k=>{ const q=W(B.J[k+n]); return gnd(q.x,q.z); }));   /* (a foot over a step's edge rests on the higher) */ gap+=Math.abs(gp); gn++; gmax=Math.max(gmax,Math.abs(gp)); if(process.env.GAP&&name==process.env.GAP&&Math.abs(gp)>0.05)console.log('  ',t.toFixed(2),n,gp.toFixed(3),'py',py.toFixed(3),'foot gnd',gnd(wp.x,wp.z).toFixed(2),'lock',st.fk[n].y.toFixed(2),'lo',(lo/K).toFixed(3)); }
    if(st.fstep&&st.fstep!==lastStep){ steps++; lastStep=st.fstep; }
    if(prev&&t>0.5) for(const n of 'LR') if(cur[n].on&&prev[n].on&&cur[n].lock===prev[n].lock){ const d=Math.min(...cur[n].P.map((p,i)=>Math.hypot(p.x-prev[n].P[i].x,p.z-prev[n].P[i].z))); slide+=d; on+=dt; maxv=Math.max(maxv,d/dt); if(process.env.DBG&&d>0.002&&name==process.env.DBG)console.log("  ",t.toFixed(2),n,d.toFixed(4),st.ph.toFixed(3),cur[n].P.map(p=>p.z.toFixed(3)).join(",")); }
    prev=cur; }
  console.log(name.padEnd(14),'a foot on the ground moves',(slide/Math.max(on,1e-6)*100).toFixed(2),'cm-ish/s (mean, world units x100), most',(maxv*100).toFixed(1),'| settling steps',steps,'| out of reach',st.fslide||0,'| quick steps',st.fquick||0,'| foot off its ground',(gap/Math.max(gn,1)*100).toFixed(1),'most',(gmax*100).toFixed(1),'| ends',pos.x.toFixed(2),pos.z.toFixed(2)); return st; }
const W=(T,f)=>({T,at:f});
run('straight',{plan:W(3,t=>({go:1,hd:0}))});
run('straight run',{plan:W(3,t=>({go:1,run:1,hd:0}))});
run('circle',{plan:W(4,t=>({go:1,hd:t*1.5}))});
run('quarter turn',{plan:W(3,t=>({go:1,hd:t<1?0:Math.PI/2}))});
run('turn running',{plan:W(3,t=>({go:1,run:1,hd:t<1?0:Math.PI/2}))});
run('u-turn',{plan:W(3,t=>({go:1,hd:t<1?0:Math.PI}))});
run('stop',{plan:W(3,t=>({go:t<1.27,hd:0}))});
run('run, stop',{plan:W(3,t=>({go:t<1.31,run:1,hd:0}))});
run('start',{plan:W(2.5,t=>({go:t>1,hd:0}))});
run('steps up',{gnd:(x,z)=>Math.max(0,Math.floor(z/0.45))*0.18,plan:W(3,t=>({go:1,hd:0}))});
run('steps down',{gnd:(x,z)=>Math.max(0,Math.floor((4-z)/0.45))*0.18,plan:W(3,t=>({go:1,hd:0}))});
