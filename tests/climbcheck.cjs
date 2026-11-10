// THE RECORDED CLIMB (owner, 8 Nov 2026; data/moves.json climb): the climb played through the rig as the page plays it (60 a second, keyed to the height
// climbed), up three cycles, still, and down three: on a ladder (no holds) and on flat bark RIG.CLIMB.gap ahead (the holds RIG.climbHolds puts there, as on
// a tree). No NaN, the cycle loops with no jump anywhere in it, the limbs take turns, a held hand or foot stays put and its limb reaches it.
// node tests/climbcheck.cjs   (reads dist/market.html: build first)
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a0=H.indexOf('const RIG=(()=>{'), src=H.slice(a0,H.indexOf('\n})();',a0)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')(), C=R.CLIMB, dt=1/60, V=16, fails=[], ok=(c,m)=>{ if(!c) fails.push(m); console.log((c?'ok   ':'FAIL ')+m); };
const d3=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z), bad=J=>Object.values(J).some(p=>!isFinite(p.x+p.y+p.z)), mk=()=>{ const st=R.create(); st.snap=true; st.smooth=true; st.climb={z:0,ph:0}; return st; };
ok(!!C&&C.P&&C.P.length>=16&&C.rise>0,'the recorded climb is in the rig: '+(C?C.src+', '+C.P.length+' keys a cycle, '+C.rise+' units a cycle, the bark '+C.gap.toFixed(1)+' ahead':'none'));
if(!C){ console.log(fails.length+' FAILED'); process.exit(1); }
// the order the limbs reach in, from the recording: each once a cycle, the left and right half a cycle apart
const ord=Object.entries(C.at).sort((a,b)=>a[1].t0-b[1].t0).map(([k,a])=>k+'@'+a.t0), half=k=>Math.abs((((C.at[k+'L'].t0-C.at[k+'R'].t0)%1)+1)%1-.5)<.05;
ok(half('h')&&half('f'),'the limbs take turns, left and right half a cycle apart: '+ord.join(' '));
// on a ladder: the pose alone
{ const st=mk(), at=ph=>{ st.climb.ph=ph; R.step(st,dt); return R.pose(st,true).J; };
  const A=at(0), B=at(C.rise); let loop=0; for(const k in A) loop=Math.max(loop,d3(A[k],B[k]));
  ok(loop<0.05,'the cycle loops: the pose a cycle on is the same within '+loop.toFixed(3)+' units');
  let seam=0, prev=null; for(let i=0;i<=2000;i++){ const J=at(i*C.rise/1000); if(prev) for(const k in J) seam=Math.max(seam,d3(J[k],prev[k])); prev=J; }
  ok(seam<0.25,'no jump anywhere in the cycle: stepped a thousandth of a cycle, no joint moves more than '+seam.toFixed(3)+' units');
  let n=0, worst=0; prev=null; const lr=[];
  for(const [dir,steps] of [[1,180],[-1,180]]) for(let i=0;i<steps;i++){ const J=at(st.climb.ph+dir*V*dt); if(bad(J)) n++;
    if(prev) for(const k in J) worst=Math.max(worst,d3(J[k],prev[k])); prev=J; lr.push([J.wristL.y-J.pelvis.y,J.wristR.y-J.pelvis.y]); }
  const m=a=>a.reduce((s,x)=>s+x,0)/a.length, mL=m(lr.map(x=>x[0])), mR=m(lr.map(x=>x[1])), cor=m(lr.map(x=>(x[0]-mL)*(x[1]-mR)))/Math.sqrt(m(lr.map(x=>(x[0]-mL)**2))*m(lr.map(x=>(x[1]-mR)**2)));
  ok(n===0,'on a ladder, up and down at '+V+' units a second: NaN in '+n+' frames (the most a joint moves in a frame: '+worst.toFixed(2)+')');
  ok(cor<0,'the hands alternate: their heights over the hips correlate '+cor.toFixed(2)); }
// on bark: the holds
const bark=(v,label)=>{ const st=mk(), BZ=C.gap; let py=0, t=0, n=0, drift=0, miss={h:0,f:0}, reach={h:0,f:0}, prev=null, worst=0, opened=0; const last={};
  const hold=(lx,ly)=>({x:lx,y:py+ly,z:BZ,nx:0,ny:0,nz:-1});
  for(const [dir,steps] of [[1,240],[0,30],[-1,240]]) for(let i=0;i<steps;i++){ t+=dt; py+=dir*v*dt; st.climb.ph=py; st.world={x:0,z:0,y:py,hd:0,kx:1,ky:1,gnd:()=>-1e9,t};
    R.climbHolds(st,dt,hold); R.step(st,dt); const J=R.pose(st,true).J; if(bad(J)) n++;
    const W=k=>({x:J[k].x,y:J[k].y+py,z:J[k].z});
    if(prev) for(const k in J) worst=Math.max(worst,d3(W(k),prev[k])); prev=Object.fromEntries(Object.keys(J).map(k=>[k,W(k)]));
    for(const s of 'LR'){ const S=st.climb.gs.L; if(S['h'+s].hf<.9) opened++;
      for(const [kind,g,j,off] of [['h',S['h'+s],'wrist'+s,{x:0,y:-1.6,z:-1.3}],['f',S['f'+s],'ankle'+s,{x:0,y:1.2,z:-2.6}]]){ const key=kind+s;
        if(!(g.e>0)){ if(last[key]&&last[key].held) drift=Math.max(drift,d3(g.p,last[key].p)); miss[kind]=Math.max(miss[kind],d3(W(j),{x:g.p.x+off.x,y:g.p.y+off.y,z:g.p.z+off.z})); }
        else reach[kind]++; last[key]={p:{...g.p},held:!(g.e>0)}; } } }
  ok(n===0,label+': on bark, up, still and down: NaN in '+n+' frames');
  ok(drift<1e-6,label+': a held hand or foot stays put on the bark until it reaches again (moved '+drift.toExponential(1)+')');
  ok(miss.h<1&&miss.f<1,label+': the limbs reach their holds: hands within '+miss.h.toFixed(2)+', feet within '+miss.f.toFixed(2)+' units');
  ok(reach.h>0&&reach.f>0&&opened>0,label+': the hands and feet reach for new holds ('+reach.h+' hand and '+reach.f+' foot frames reaching), a hand opens as it goes');
  return worst; };
const wFast=bark(V,'climbing '+V+' a second'), wSlow=bark(2,'climbing 2 a second');
ok(wSlow<0.6,'on bark nothing jumps: climbing slowly the most any joint moves in a frame is '+wSlow.toFixed(2)+' units (at '+V+' a second: '+wFast.toFixed(2)+')');
console.log(fails.length?fails.length+' FAILED':'all ok'); process.exit(fails.length?1:0);
