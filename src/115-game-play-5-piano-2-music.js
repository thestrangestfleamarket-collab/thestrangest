const PNBOOK=[
  {name:'Prelude in C (Bach)',q:0.19,bar:16,pickup:0,vel:{R:.5,L:.46},pedal:true,gen:()=>{ const C=('C4 E4 G4 C5 E5|C4 D4 A4 D5 F5|B3 D4 G4 D5 F5|C4 E4 G4 C5 E5|C4 E4 A4 E5 A5|C4 D4 F#4 A4 D5|B3 D4 G4 D5 G5|B3 C4 E4 G4 C5|A3 C4 E4 G4 C5|'+
      'D3 A3 D4 F#4 C5|G3 B3 D4 G4 B4|G3 A#3 E4 G4 C#5|F3 A3 D4 A4 D5|F3 G#3 D4 F4 B4|E3 G3 C4 G4 C5|E3 F3 A3 C4 F4|D3 F3 A3 C4 F4|G2 D3 G3 B3 F4|C3 E3 G3 C4 E4|C3 G3 A#3 C4 E4|'+
      'F2 F3 A3 C4 E4|F#2 C3 A3 C4 D#4|G#2 F3 B3 C4 D4|G2 F3 G3 B3 D4|G2 E3 G3 C4 E4|G2 D3 G3 C4 F4|G2 D3 G3 B3 F4|G2 D#3 A3 C4 F#4|G2 E3 G3 C4 G4|G2 D3 G3 C4 F4|G2 D3 G3 B3 F4|C2 C3 G3 A#3 E4').split('|').map(b=>b.split(' '));
    const L1=[], L2=[], R=[]; for(const [a,b,c,d,e] of C)for(let h=0;h<2;h++){ L1.push(a+':8'); L2.push('r:1',b+':7'); R.push('r:2',c+':1',d,e,c,d,e); }
    L1.push('C2:16','C2:16','C2:32'); L2.push('r:1','C3:15','r:1','B2:15','r:32');
    R.push('r:2','F3:1','A3 C4 F4 C4 A3 C4 A3 F3 A3 F3 D3 F3 D3','r:2','G4 B4 D5 F5 D5 B4 D5 B4 G4 B4 D4 F4 E4 D4','E4+G4+C5:32');
    return {R:[R.join(' ')],L:[L1.join(' '),L2.join(' ')]}; }},
  {name:'Für Elise (Beethoven)',q:0.2,bar:6,pickup:2,vel:{R:.56,L:.4},pedal:true,gen:()=>{
    const A=['E5:1 D#5 E5 B4 D5 C5','A4:2 r:1 C4:1 E4 A4','B4:2 r:1 E4:1 G#4 B4','C5:2 r:1 E4:1 E5 D#5','E5:1 D#5 E5 B4 D5 C5','A4:2 r:1 C4:1 E4 A4','B4:2 r:1 E4:1 C5 B4'].join(' ');
    const AL=['r:6','A2:1 E3 A3 r:3','E2:1 E3 G#3 r:3','A2:1 E3 A3 r:3','r:6','A2:1 E3 A3 r:3','E2:1 E3 G#3 r:3'].join(' ');
    const B='E5:3 G4:1 F5 E5 D5:3 F4:1 E5 D5 C5:3 E4:1 D5 C5 B4:2 r:1 E4:1 E5 r r E5 E6 r r D#5 E5 r r D#5 E5 D#5 E5 D#5 E5 D#5';
    const BL='C3:1 G3 C4 r:3 G2:1 G3 B3 r:3 A2:1 E3 A3 r:3 E2:1 E3 r:4 r:6 r:6 r:6';
    return {R:['E5:1 D#5 '+A+' A4:2 r:2 E5:1 D#5 '+A+' A4:2 r:1 B4:1 C5 D5 '+B+' '+A+' A4:12'],L:['r:2 '+AL+' A2:1 E3 A3 r:3 '+AL+' A2:1 E3 A3 r:3 '+BL+' '+AL+' A2:1 E3:1 A3:10']}; }},
  {name:'Gymnopédie No. 1 (Satie)',q:0.22,bar:12,pickup:0,vel:{R:.5,L:.36},pedal:true,gen:()=>{ const L1=[], L2=[];
    for(let b=0;b<20;b++){ const g=!(b&1); L1.push((g?'G2':'D2')+':12'); L2.push('r:4',(g?'B3+D4+F#4':'A3+C#4+F#4')+':8'); }
    L1.push('G2:36'); L2.push('r:4','B3+D4+F#4:32');
    const ph='r:4 F#5:4 A5:4 G5:4 F#5:4 C#5:4 B4:4 C#5:4 D5:4 A4:12 F#4:48';
    return {R:['r:48 '+ph+' '+ph+' r:36'],L:[L1.join(' '),L2.join(' ')]}; }}];
const PNNAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const pnMidi=s=>{ const m=/^([A-G])([#b]?)(-?\d)$/.exec(s); if(!m)throw new Error('piano: no such note '+s); return PNNAMES.indexOf(m[1])+(m[2]==='#'?1:m[2]==='b'?-1:0)+12*(+m[3]+1); };
const pnBlack=m=>[1,3,6,8,10].includes(m%12);
const pnWhite=m=>{ const o=Math.floor(m/12), p=m%12, w=[0,0.5,1,1.5,2,3,3.5,4,4.5,5,5.5,6][p]; return o*7+w-12; };
function pnVoice(s){ const out=[]; let t=0, d=1; for(const tok of s.trim().split(/\s+/)){ if(!tok||tok==='|')continue; const [p,l]=tok.split(':'); if(l)d=+l;
    if(p!=='r')out.push({t,keys:p.split('+').map(pnMidi),d}); t+=d; } return out; }
function pnCompile(T){ if(T.c)return T.c; const S=T.gen(), notes=[], q=T.q, T0=1.0;
  for(const h of ['R','L'])for(const v of S[h])for(const e of pnVoice(v))for(const m of e.keys){ const acc=(e.t-T.pickup)%T.bar===0?.07:0, jit=(hash3(e.t,m,733)-.5)*.08;
    notes.push({m,h,t0:T0+e.t*q,t1:T0+(e.t+e.d)*q-0.03,vel:Math.max(.12,Math.min(1,T.vel[h]+acc+jit))}); }
  notes.sort((a,b)=>a.t0-b.t0||a.m-b.m);
  for(const h of ['R','L']){ const ns=notes.filter(n=>n.h===h); let i=0;
    while(i<ns.length){ const ks=new Set(); let j=i, lo=1e9, hi=-1e9;
      for(;j<ns.length;j++){ const n=ns[j], w=pnWhite(n.m), l2=Math.min(lo,w), h2=Math.max(hi,w), k2=new Set(ks).add(n.m); if(k2.size>5||h2-l2>7)break; ks.add(n.m); lo=l2; hi=h2; }
      const keys=[...ks].sort((a,b)=>a-b), sp=Math.max(1,hi-lo), fs={}; let prev=0;
      keys.forEach((m,k)=>{ const ideal=1+Math.round((pnWhite(m)-lo)/sp*Math.min(4,Math.round(sp))); let f=Math.max(prev+1,ideal); f=Math.min(f,5-(keys.length-1-k)); fs[m]=f; prev=f; });
      for(let k=i;k<j;k++){ const n=ns[k]; n.f=h==='R'?fs[n.m]:6-fs[n.m]; n.seg=i; } i=j; }
    for(let a=0;a<ns.length;a++)for(let b=a+1;b<ns.length&&ns[b].t0<ns[a].t1;b++)if(ns[b].f===ns[a].f||ns[b].m===ns[a].m)ns[a].t1=Math.min(ns[a].t1,ns[b].t0-0.04); }
  const ped=[]; if(T.pedal){ const end=notes.reduce((x,n)=>Math.max(x,n.t1),0); for(let b=T.pickup;T0+b*q<end;b+=T.bar){ const s=T0+b*q; ped.push({dn:s+0.07,up:Math.min(end+0.6,s+T.bar*q-0.03)}); } }
  const pedAt=t=>ped.find(p=>p.dn<=t&&t<p.up);
  for(const n of notes){ const p=pedAt(n.t1); n.off=p?Math.max(n.t1,p.up):n.t1; }
  const len=notes.reduce((x,n)=>Math.max(x,n.off),0)+1.5;
  return T.c={notes,ped,len,R:notes.filter(n=>n.h==='R'),L:notes.filter(n=>n.h==='L')}; }
