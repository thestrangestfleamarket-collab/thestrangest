// THE GUITAR TUNES: GTBOOK, the guitar's songs as tabs, and the playing of them in time.
import {GT} from './106-game-play-3-guitar-1-body.js';
const GTTAB=[
  ['-7-----7-----7-----|-7-----5-----3-----|-3-----2-----0-----|-0-----3-----7-----','---0-----0-----0---|---0-----0-----0---|---0-----0-----0---|---0-----0-----0---',
   '-----0-----0-----0-|-----0-----0-----0-|-----0-----0-----0-|-----0-----0-----0-','','','-0-----------------|-0-----------------|-0-----------------|-0-----------------'],
  ['-12----12----12----|-12----10----8-----|-8-----7-----5-----|-5-----7-----8-----','---0-----0-----0---|---0-----0-----0---|---5-----5-----5---|---5-----5-----5---',
   '-----0-----0-----0-|-----0-----0-----0-|-----5-----5-----5-|-----5-----5-----5-','','-------------------|-------------------|-0-----------------|-0-----------------','-0-----------------|-0-----------------|-------------------|-------------------'],
  ['-7-----8-----7-----|-11----8-----7-----|-7-----5-----3-----|-3-----2-----0-----','---7-----7-----7---|---7-----7-----7---|---0-----0-----0---|---0-----0-----0---',
   '-----8-----8-----8-|-----8-----8-----8-|-----0-----0-----0-|-----0-----0-----0-','','','-7-----------------|-7-----------------|-0-----------------|-0-----------------'],
  ['-2-----2-----2-----|-2-----3-----2-----|-0-----0-----0-----|-0-----------------','---0-----0-----0---|---0-----0-----0---|---0-----0-----0---|-0-----------------',
   '-----2-----2-----2-|-----2-----2-----2-|-----0-----0-----0-|-0-----------------','-------------------|-------------------|-2-----------------|-------------------',
   '-2-----------------|-2-----------------|-------2-----------|-------------------','-------------------|-------------------|-------------3-----|-0-----------------'],
  ['-4-----4-----4-----|-4-----2-----0-----|-------------------|-------------------','---0-----0-----0---|---0-----0-----0---|-5-----4-----4-----|-4-----3-----4-----',
   '-----1-----1-----1-|-----1-----1-----1-|---2-----2-----2---|---2-----2-----2---','-------------------|-------------------|-----4-----4-----4-|-----4-----4-----4-',
   '-------------------|-------------------|-2-----------------|-2-----------------','-0-----------------|-0-----------------|-------------------|-------------------'],
  ['-9-----9-----9-----|-9-----11----9-----|-9-----7-----7-----|-7-----9-----11----','---7-----7-----7---|---7-----7-----7---|---9-----9-----9---|---9-----9-----9---',
   '-----8-----8-----8-|-----8-----8-----8-|-----9-----9-----9-|-----9-----9-----9-','','','-7-----------------|-7-----------------|-0-----------------|-0-----------------'],
  ['-12----12----12----|-12----11----10----|-9-----9-----9-----|-9-----7-----5-----','---9-----9-----9---|---9-----9-----9---|---5-----5-----5---|---5-----5-----5---',
   '-----9-----9-----9-|-----9-----9-----9-|-----6-----6-----6-|-----6-----6-----6-','','-------------------|-------------------|-0-----------------|-0-----------------','-0-----------------|-0-----------------|-------------------|-------------------'],
  ['-4-----4-----4-----|-4-----5-----2-----|-0-----0-----0-----|-0-----------------','---4-----4-----4---|---4-----4-----4---|---0-----0-----0---|-0-----------------',
   '-----2-----2-----2-|-----2-----2-----2-|-----1-----1-----1-|-1-----------------','-------------------|-------------------|-2-----------------|-------------------',
   '-2-----------------|-2-----------------|-------2-----------|-------------------','-------------------|-------------------|-------------4-----|-0-----------------']];
const GTTAB2=[
  ['--------0----------|--------0----------|--------2----------|--------1----------','------1---1--------|------1---1--------|------3---3--------|------1---1--------',
   '----2-------2------|----0-------0------|----2-------2------|----2-------2------','--2-----------2----|--2-----------2----|--0-----------0----|--3-----------3----','',''],
  ['--------0----------|--------0----------|--------0----------|--------0----------','------1---1--------|------0---0--------|------1---1--------|------0---0--------',
   '----2-------2------|----1-------1------|----2-------2------|----1-------1------','--2-----------2----|--2-----------2----|--2-----------2----|--2-----------2----','','']];
const GTCHORD=(()=>{ const C={}, D={
  C:'0 1 0 2 3 x|0 1 0 2 3 0', C7:'0 1 3 2 3 x|0 1 4 2 3 0', F:'1 1 2 3 x x|1 1 2 3 0 0', G:'3 0 0 0 2 3|4 0 0 0 2 3', G7:'1 0 0 0 2 3|1 0 0 0 2 3',
  D:'2 3 2 0 x x|2 3 1 0 0 0', D7:'2 1 2 0 x x|3 1 2 0 0 0', Dm:'1 3 2 0 x x|1 3 2 0 0 0', A:'0 2 2 2 0 x|0 3 2 1 0 0', A7:'0 2 0 2 0 x|0 3 0 2 0 0', Am:'0 1 2 2 0 x|0 1 3 2 0 0',
  E:'0 0 1 2 2 0|0 0 1 3 2 0', E7:'0 0 1 0 2 0|0 0 1 0 2 0', Em:'0 0 0 2 2 0|0 0 0 3 2 0', B7:'2 0 2 1 2 x|4 0 3 1 2 0'};
  for(const n in D){ const [k,f]=D[n].split('|').map(s=>s.split(' ')); C[n]=k.map((x,i)=>x==='x'?null:{s:i+1,k:+x,f:+f[i]}).filter(Boolean); } return C; })();
const GTBOOK=[
  {name:'Romance',tab:GTTAB,q:0.25,per:9,c0:1,beat:0.75},
  {name:'the roll in A minor',tab:GTTAB2,q:0.25,per:8,c0:2,beat:0.5,kept:true},
  {name:'Cielito Lindo',beat:0.4,beats:3,times:2,pattern:'D du du',chords:'C C G7 G7 G7 G7 C C C C G7 G7 G7 G7 C C C C F F C C G7 G7 G7 G7 C C G7 G7 C C'},
  {name:'La Cucaracha',beat:0.5,beats:4,times:2,pattern:'D du D du',chords:'A A E7 E7 E7 E7 A A A A E7 E7 E7 E7 A A'},
  {name:'De Colores',beat:0.52,beats:3,times:2,pattern:'D du du',chords:'G G G G D7 D7 D7 D7 D7 D7 D7 D7 G G G G G G G7 G7 C C C C G G D7 D7 G G G G'},
  {name:'Las Mañanitas',beat:0.62,beats:3,times:2,pattern:'D du du',chords:'C C G7 G7 G7 G7 C C C C7 F F C G7 C C'}];
function gtCompile(T){ if(T.c)return T.c; const tune=[], strum=[], bars=[], AMP={p:0.62,i:0.48,m:0.48,a:0.56}, TONE={p:2600,i:4200,m:4200,a:4600,s:4200};
  if(T.tab){ const time=q=>1.0+q*T.q; let bar=0;
    for(const sys of T.tab){ const rows=sys.map(r=>r?r.split('|'):null), nb=rows[0].length;
      for(let b=0;b<nb;b++,bar++){ const notes=[];
        rows.forEach((r,si)=>{ const seg=r?r[b]:''; for(let c=0;c<seg.length;c++){ if(!/\d/.test(seg[c])||/\d/.test(seg[c-1]||''))continue; const k=parseInt(seg.slice(c,c+2),10); notes.push({q:bar*T.per+(c-T.c0)/2,s:si+1,k}); } });
        const strs=[...new Set(notes.map(n=>n.s))].sort((a,b)=>a-b), up=strs.slice(0,3);
        for(const n of notes){ const r=up.includes(n.s)?['a','m','i'][up.indexOf(n.s)]:'p'; tune.push({t:time(n.q),s:n.s,k:n.k,r,amp:AMP[r],tone:TONE[r]}); }
        bars.push(time(bar*T.per)); } } }
  else { const time=b=>1.0+b*T.beat, pat=[]; T.pattern.split(' ').forEach((w,i)=>{ for(let j=0;j<w.length;j++)pat.push([i+j/w.length,w[j]]); });
    const names=T.chords.split(' '), form=[]; for(let r=0;r<T.times;r++)form.push(...names); form.push(names[0]); let prev=null;
    form.forEach((nm,bar)=>{ const ch=GTCHORD[nm], last=bar===form.length-1; bars.push(time(bar*T.beats));
      for(const [b,kind] of last?[[0,'D']]:pat){ const t0=time(bar*T.beats+b), full=kind==='D', dn=kind!=='u', ss=ch.filter(c=>full||c.s<=4).map(c=>c.s).sort((a,b)=>dn?b-a:a-b);
        const sx=s=>GT.sx(s,GT.YS), x0=sx(ss[0])+(dn?-0.3:0.3), x1=sx(ss[ss.length-1])+(dn?0.3:-0.3), Tm=full?0.055:0.03; strum.push({t0,T:Tm,x0,x1});
        for(const s of ss){ const c=ch.find(c=>c.s===s); tune.push({t:t0+Tm*(sx(s)-x0)/(x1-x0),s,k:c.k,f0:c.f,r:'s',amp:(dn?0.4:0.32)*(full&&s>4?1.15:1),tone:TONE.s,ch:nm!==prev?ch:null}); }
        prev=nm; } }); }
  tune.sort((a,b)=>a.t-b.t||b.s-a.s);
  { const nx=[]; for(let i=tune.length-1;i>=0;i--){ const n=tune[i]; n.d=(nx[n.s]??n.t+3)-n.t; nx[n.s]=n.t; } }
  const lh=[], pos=[], held=new Map(); let p=1; const end=(q,t)=>{ q.t1=Math.max(q.t0+0.05,t); held.delete(q); }, on=s=>[...held.keys()].filter(q=>q.s===s), reach=p=>p>=7?4:3;
  for(const n of tune){ if(n.ch)for(const q of [...held.keys()])if(!n.ch.some(c=>c.s===q.s&&c.k===q.k))end(q,n.t-0.07);
    let kept=null; for(const q of on(n.s)){ if(n.r==='s'&&n.k&&q.k===n.k)kept=q; else end(q,n.t-0.07); }
    if(!n.k)continue; if(kept){ n.f=kept.f; continue; }
    if(n.k<p||n.k>p+reach(p)){ let best=null; for(let c=Math.max(1,n.k-4);c<=n.k;c++){ if(n.k>c+reach(c))continue; const keep=[...held.keys()].filter(q=>q.k>=c&&q.k<=c+reach(c)).length, sc=keep*10-Math.abs(c-p); if(!best||sc>best[0])best=[sc,c]; }
      p=best[1]; pos.push({t:n.t,p}); for(const q of [...held.keys()])if(q.k<p||q.k>p+reach(p))end(q,n.t-0.12); }
    let f=n.f0||Math.min(4,n.k-p+1); const busy=f=>[...held.keys()].find(q=>q.f===f);
    const b=busy(f); if(b&&!(f===1&&b.k===n.k)){ const alt=[f+1,f-1,f+2,f-2].find(g=>g>=1&&g<=4&&!busy(g)); if(alt)f=alt; else end(b,n.t-0.1); }
    const q={f,s:n.s,k:n.k,t0:n.t-0.06,t1:1e9}; held.set(q,1); lh.push(q); n.f=f; }
  for(const q of [...held.keys()])end(q,tune[tune.length-1].t+3);
  if(!pos.length||pos[0].t>0)pos.unshift({t:0,p:pos.length?pos[0].p:1}); lh.sort((a,b)=>a.t0-b.t0);
  const fret=(s,t)=>lh.reduce((m,q)=>q.s===s&&q.t0<=t&&t<q.t1?Math.max(m,q.k):m,0);
  for(const n of tune)n.at=fret(n.s,n.t);
  const damp=[]; for(const q of lh)for(const t of [q.t0,q.t1]){ const last=tune.filter(n=>n.s===q.s&&n.t<=t).pop(); if(last&&t-last.t<6&&t-last.t>0.02&&fret(q.s,t-0.001)!==fret(q.s,t+0.001))damp.push({s:q.s,t}); } damp.sort((a,b)=>a.t-b.t);
  const len=tune.reduce((m,n)=>Math.max(m,n.t),0)+2.5, ev=tune.map(n=>({t:n.t,n})).concat(damp.map(q=>({t:q.t,s:q.s}))).sort((a,b)=>a.t-b.t);
  return T.c={tune,strum,bars,lh,pos,damp,len,ev}; }
let GTSONG=0, GTTUNE=[], GTSTRUM=[], GTBAR=[], GTLH=[], GTPOS=[{t:0,p:1}], GTDAMP=[], GTEND=0, GTPRE=0, GTEV=[], GTBEAT=0.75;
const GTS={t:0,i:0,sent:0,env:[0,0,0,0,0,0]};
function gtSet(i){ const T=GTBOOK[i], c=gtCompile(T); GTSONG=i; GTTUNE=c.tune; GTSTRUM=c.strum; GTBAR=c.bars; GTLH=c.lh; GTPOS=c.pos; GTDAMP=c.damp; GTEND=c.len; GTPRE=Math.ceil(GTEND)+0.6; GTEV=c.ev; GTBEAT=T.beat;
  GTS.t=0; GTS.i=0; GTS.sent=0; GTS.env.fill(0); }
const gtNext=i=>{ do i=(i+1)%GTBOOK.length; while(GTBOOK[i].kept); return i; };
for(const T of GTBOOK)gtCompile(T); gtSet(0);
const gtPosAt=t=>{ let a=GTPOS[0]; for(const q of GTPOS){ if(q.t-0.15>t)break; a=q; } const i=GTPOS.indexOf(a), pv=i>0?GTPOS[i-1]:a, u=Math.max(0,Math.min(1,(t-(a.t-0.15))/0.13)); return pv.p+(a.p-pv.p)*u*u*(3-2*u); };
export {GTBOOK, GTDAMP, GTEV, GTLH, gtNext, gtPosAt, GTS, gtSet, GTSONG, GTSTRUM, GTTUNE};
