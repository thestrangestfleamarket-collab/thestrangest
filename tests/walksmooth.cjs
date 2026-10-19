// IS HIS WALK SMOOTH (owner, 18 Oct 2026: "right now its super choppy and jumpy"): the rig lifted from dist/market.html and played as the page
// plays him (step, carried his distance x W3.SZ, st.world, posed every frame) at a steady 60 Hz, at 144 Hz and at 60 Hz with uneven frames.
// Per frame: how far he goes (should be even), his pelvis's and his head's height and place (a jump: a change much bigger than the frames
// around it), the feet. node tests/walksmooth.cjs [walk|run]
const fs=require('fs'), H=fs.readFileSync(__dirname+'/../dist/market.html','utf8'), a=H.indexOf('const RIG=(()=>{'), src=H.slice(a,H.indexOf('\n})();',a)+6);
global.window=global; global.location={search:''}; global.document={createElement:()=>({getContext:()=>({})})}; global.localStorage={getItem:()=>null,setItem(){}};
const R=new Function(src+'\nreturn RIG;')(), SZ=1.2, PPU=30, K=PPU/SZ, run=process.argv[2]==='run';
function play(name,dts){ const st=R.create(); st.snap=true; st.smooth=process.env.STEPPED!=="1"; st.target=1; st.runTarget=run?1:0; let z=0,t=0; const F=[];
  for(const dt of dts){ t+=dt; const b=st.dist; R.step(st,dt); const go=(st.dist-b)*SZ/PPU; z+=go; st.world={x:0,z,y:0,hd:0,kx:K,ky:K,gnd:()=>0,t}; const B=R.pose(st,true);
    const W=p=>({y:p.y/K,z:z+p.z/K}); F.push({dt,go,pel:W(B.J.pelvis),head:W(B.J.head),fl:W(B.J.ankleL),fr:W(B.J.ankleR)}); }
  const S=F.slice(60), sp=S.map(f=>f.go/f.dt), m=sp.reduce((a,b)=>a+b)/sp.length, sd=Math.sqrt(sp.reduce((a,b)=>a+(b-m)**2,0)/sp.length);
  const jumps=(k,ax)=>{ let n=0,mx=0; for(let i=2;i<S.length;i++){ const v1=(S[i][k][ax]-S[i-1][k][ax])/S[i].dt, v0=(S[i-1][k][ax]-S[i-2][k][ax])/S[i-1].dt, acc=Math.abs(v1-v0)/S[i].dt; mx=Math.max(mx,acc); if(acc>60)n++; } return n+' ('+mx.toFixed(0)+')'; };
  const sec=S.reduce((a,f)=>a+f.dt,0);
  console.log(name.padEnd(16),'speed',m.toFixed(2),'+/-',(sd/m*100).toFixed(0)+'%','| sudden jolts a second (worst, units/s²): pelvis up/down',(+jumps('pel','y').split(' ')[0]/sec).toFixed(1),jumps('pel','y').split(' ')[1],
    ' head up/down',(+jumps('head','y').split(' ')[0]/sec).toFixed(1),jumps('head','y').split(' ')[1],' head along',(+jumps('head','z').split(' ')[0]/sec).toFixed(1),jumps('head','z').split(' ')[1]); }
const N=60*8, rnd=(()=>{ let s=1; return ()=>{ s=(s*16807)%2147483647; return s/2147483647; }; })();
play('60 Hz',Array(N).fill(1/60));
play('144 Hz',Array(N*2.4|0).fill(1/144));
play('60 Hz uneven',Array(N).fill(0).map(()=>1/60*(0.7+0.6*rnd())));
play('30 Hz',Array(N/2).fill(1/30));
