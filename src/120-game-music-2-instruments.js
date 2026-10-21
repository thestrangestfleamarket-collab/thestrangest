const IMNOTE=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const imHz=m=>440*Math.pow(2,(m-69)/12), imName=m=>IMNOTE[((m%12)+12)%12]+(Math.floor(m/12)-1);
const IMR={
  membrane:[[1,1],[1.594,1],[2.136,1],[2.296,0],[2.653,1],[2.918,1],[3.156,1],[3.501,1],[3.6,0],[3.652,1]],
  freebar:[1,2.756,5.404,8.933,13.344],
  marimba:[1,3.99,9.95],
  xylo:[1,3.01,6.1],
  tine:[1,6.267,17.55],
  tube:[1,2.756,5.404,8.933,13.344,18.64],
  pan:[1,2,3,4.02]};
const IMJ=[[0,2.405],[1,3.832],[2,5.136],[0,5.52],[3,6.38],[1,7.016],[4,7.588],[2,8.417],[0,8.654],[5,8.771]];
function imString(L,gauge,rho,hz,E=0){ const d=gauge*.0254, mu=rho*Math.PI*d*d/4, T=mu*(2*L*hz)**2, B=E?Math.PI**3*E*(d*.6)**4/(64*T*L*L):0; return {d,mu,T,B,kg:T/9.81}; }
const imLoop=(hz,t60)=>Math.pow(10,-3/(t60*hz));

const imFret=(kind,o)=>{ const S=o.open.map((m,i)=>imString(o.L,o.gauge[i],o.rho[i],imHz(m),o.E?o.E[i]:0)); IMK[kind]={lay:'fret',...o,S,
  dsp:{fam:'pluck',n:o.open.length,body:o.body||[],dry:o.dry??.22,wet:o.wet??.5,gain:o.gain||1,pick:o.pick||0,amp:o.amp||0,pair:o.pair||0}}; };
imFret('classical guitar',{name:'Classical guitar',L:.65,frets:19,open:[64,59,55,50,45,40],gauge:[.028,.0325,.040,.029,.035,.043],rho:[1140,1140,1140,4500,5500,6500],E:[5e9,5e9,5e9,5e9,5e9,5e9],
  t60:[4,4.5,5,6,7,8],a:[.62,.58,.55,.5,.46,.42],bright:.6,body:[[95,.18,1],[190,.12,.8],[250,.095,.5],[400,.072,.55],[560,.058,.4],[720,.036,.3]]});
imFret('steel-string guitar',{name:'Steel-string guitar',L:.645,frets:20,open:[64,59,55,50,45,40],gauge:[.012,.016,.024,.032,.042,.053],rho:[7850,7850,6200,6000,5900,5900],E:[200e9,200e9,200e9,200e9,200e9,200e9],
  t60:[6,7,8,9,10,11],a:[.78,.74,.7,.66,.62,.58],bright:.9,body:[[100,.2,1],[205,.13,.9],[290,.1,.5],[390,.08,.6],[500,.06,.45],[700,.04,.35],[1200,.02,.2]],dry:.3});
imFret('electric guitar',{name:'Electric guitar',L:.648,frets:22,open:[64,59,55,50,45,40],gauge:[.010,.013,.017,.026,.036,.046],rho:[7850,7850,7850,6600,6400,6300],E:[200e9,200e9,200e9,200e9,200e9,200e9],
  t60:[8,9,10,11,12,13],a:[.85,.82,.8,.76,.72,.68],bright:1,body:[],dry:1.2,wet:0,pick:.12,amp:3.2,gain:.9});
imFret('bass guitar',{name:'Bass guitar',L:.864,frets:20,open:[43,38,33,28],gauge:[.045,.065,.085,.105],rho:[6400,6200,6000,6000],E:[200e9,200e9,200e9,200e9],
  t60:[8,9,10,11],a:[.6,.56,.52,.48],bright:.7,body:[],dry:1.4,wet:0,pick:.18,amp:1.3,gain:1});
imFret('ukulele',{name:'Ukulele',L:.345,frets:12,open:[69,64,60,67],gauge:[.024,.031,.036,.026],rho:[1780,1780,1780,1780],E:[5e9,5e9,5e9,5e9],
  t60:[1.6,1.8,2,1.7],a:[.6,.58,.55,.6],bright:.55,body:[[230,.1,1],[400,.07,.8],[600,.05,.5],[900,.03,.3]],dry:.28,wet:.6});
imFret('banjo',{name:'Banjo',L:.67,frets:22,open:[62,59,55,50,67],gauge:[.010,.012,.013,.020,.010],rho:[7850,7850,7850,6600,7850],E:[200e9,200e9,200e9,200e9,200e9],
  t60:[2.6,2.8,3,3.4,2.6],a:[.85,.83,.82,.78,.85],bright:1,fifth:5,body:[[320,.05,.8],[620,.04,1],[1100,.03,.9],[1900,.02,.7],[2900,.015,.5]],dry:.4,wet:.8});
imFret('mandolin',{name:'Mandolin',L:.35,frets:20,open:[76,69,62,55],gauge:[.011,.015,.026,.040],rho:[7850,7850,6600,6400],E:[200e9,200e9,200e9,200e9],
  t60:[2.4,2.8,3.2,3.8],a:[.86,.84,.8,.76],bright:1,pair:3,body:[[145,.12,.8],[390,.08,1],[650,.05,.6],[900,.04,.5],[1400,.025,.3]],dry:.3,wet:.6});
for(const k in IMK)IMK[k].S.forEach((s,i)=>{ const I=IMK[k], hz=imHz(I.open[i]); s.g=imLoop(hz,I.t60[i]); s.a=I.a[i]; s.ap=Math.min(.35,s.B*3000); });
{ const notes=[]; for(let m=36;notes.length<34;m++)if([0,2,4,5,7,9,11].includes(m%12))notes.push(m);
  const S=notes.map((m,i)=>{ const hz=imHz(m), L=Math.max(.06,1.35*Math.pow(.92,i)), wound=i<6, d=Math.sqrt(4*8*9.81/(Math.PI*(wound?5200:1140)*(2*L*hz)**2))/.0254;
    const s=imString(L,d,wound?5200:1140,hz,5e9); s.L=L; s.g=imLoop(hz,Math.max(1.2,8-i*.2)); s.a=Math.max(.35,.55-i*.004); s.ap=Math.min(.2,s.B*3000); return s; });
  IMK['harp']={name:'Harp',lay:'harp',notes,S,bright:.55,dsp:{fam:'pluck',n:34,body:[[120,.15,1],[220,.11,.8],[350,.08,.6],[500,.06,.5],[750,.04,.35]],dry:.25,wet:.55,gain:.8}}; }
IMK['violin']={name:'Violin',lay:'bow',L:.328,open:[76,69,62,55],gauge:[.0102,.0126,.0164,.0218],rho:[7850,5200,6200,7000],
  dsp:{fam:'bow',n:4,body:[[275,.07,1],[460,.05,.9],[540,.05,.9],[1100,.03,.5],[2500,.012,.7]],dry:.25,wet:.6,gain:1.4}};
IMK['cello']={name:'Cello',lay:'bow',L:.69,open:[57,50,43,36],gauge:[.0189,.0236,.0315,.0433],rho:[7850,6500,7000,7400],
  dsp:{fam:'bow',n:4,body:[[100,.09,1],[175,.07,.9],[205,.07,.9],[480,.04,.5],[1000,.02,.5]],dry:.25,wet:.6,gain:1.4}};
for(const k of ['violin','cello']){ const I=IMK[k]; I.S=I.open.map((m,i)=>imString(I.L,I.gauge[i],I.rho[i],imHz(m))); }
IMK['flute']={name:'Flute',lay:'pipe',lo:60,hi:96,dsp:{fam:'pipe',nz:.14,pole:.5,att:.0012,tune:9.3,gain:.9}};
IMK['recorder']={name:'Recorder',lay:'pipe',lo:72,hi:98,dsp:{fam:'pipe',nz:.07,pole:.62,att:.002,tune:6.6,gain:.9}};
IMK['drum kit']={name:'Drum kit',lay:'drums',dsp:{fam:'hit',poly:32,body:[],dry:0,wet:0,gain:.9},
  parts:[{n:'kick',k:'head',f:55,t:.32,d:22,click:1,x:.5,y:.62},{n:'snare',k:'head',f:190,t:.3,d:14,wires:1,x:.32,y:.62},{n:'tom 1',k:'head',f:160,t:.7,d:10,x:.4,y:.36},{n:'tom 2',k:'head',f:125,t:.8,d:12,x:.6,y:.36},
    {n:'floor tom',k:'head',f:85,t:1.1,d:16,x:.74,y:.66},{n:'hi-hat',k:'hat',f:340,t:.08,d:14,x:.17,y:.48},{n:'crash',k:'cym',f:300,t:2.6,d:16,x:.24,y:.2},{n:'ride',k:'cym',f:240,t:5,d:20,x:.84,y:.3}]};
const imBars=(kind,name,lay,r,notes,t60,tau,o={})=>{ IMK[kind]={name,lay,notes,modes:IMR[r],t60,tau,...o,dsp:{fam:'hit',poly:24,body:o.body||[],dry:o.body?.05:0,wet:o.body?.5:0,gain:o.gain||1}}; };
const imRange=(lo,hi,dia)=>{ const o=[]; for(let m=lo;m<=hi;m++)if(!dia||[0,2,4,5,7,9,11].includes(m%12))o.push(m); return o; };
imBars('xylophone','Xylophone','bars','xylo',imRange(65,96),m=>Math.max(.25,.9-(m-65)*.02),.0006,{res:1});
imBars('marimba','Marimba','bars','marimba',imRange(48,84),m=>Math.max(.6,3.2-(m-48)*.07),.0022,{res:1});
imBars('glockenspiel','Glockenspiel','bars','freebar',imRange(79,108),m=>Math.max(1.5,4.5-(m-79)*.08),.0003,{gain:.6});
imBars('tubular bells','Tubular bells','bells','tube',imRange(72,89),()=>9,.0009,{gain:.7});
imBars('kalimba','Kalimba','tines','tine',[60,62,64,65,67,69,71,72,74,76,77,79,81,83,84,86,88],m=>Math.max(1.2,3-(m-60)*.06),.0012,{body:[[240,.08,1],[520,.05,.6]],gain:.9});
imBars('steel pan','Steel pan','pan','pan',imRange(62,88),m=>Math.max(.8,1.8-(m-62)*.03),.0013,{gain:.8});
function imFretHz(I,s,f){ return imHz(I.open[s])*Math.pow(2,f/12); }
function imAct(kind,a){ '@later'; const I=IMK[kind]; if(!I||!a)return []; const fam=I.dsp.fam, ok={pluck:'pluck',stop:'pluck',mute:'pluck',bow:'bow',pz:'bow',blow:'pipe',hit:'hit'}[a.k];
  if(!ok||ok!==fam||(a.s!=null&&!(a.s>=0&&a.s<(I.S||I.open||[]).length))||(a.i!=null&&!(a.i>=0&&a.i<(I.parts||I.notes||[]).length))||(a.s==null&&ok!=='pipe'&&ok!=='hit')||(ok==='hit'&&a.i==null))return [];
  const v=Math.max(0,Math.min(1,+a.v||(a.v===0?0:.7))), dt=Math.max(0,Math.min(1,+a.dt||0));
  if(a.k==='pluck'){ const S=I.S[a.s]; if(!S)return []; const hz=I.lay==='harp'?imHz(I.notes[a.s]+(a.f||0)):imFretHz(I,a.s,a.f||0);
    return [{k:'pluck',s:a.s,hz,amp:v*.9,pos:Math.max(.04,Math.min(.5,a.p??.16)),bright:a.b??I.bright,g:Math.pow(S.g,Math.pow(2,(a.f||0)/12)),a:S.a,ap:S.ap,dt}]; }
  if(a.k==='stop')return [{k:'stop',s:a.s,hz:imFretHz(I,a.s,a.f||0),dt}];
  if(a.k==='mute')return [{k:'mute',s:a.s,v:a.v,dt}];
  if(a.k==='bow'||a.k==='pz'){ const hz=imHz(I.open[a.s])/(1-Math.min(.75,a.x||0)); return a.k==='bow'?[{k:'bow',s:a.s,hz,v,f:a.f??.5,dt}]:[{k:'pz',s:a.s,hz,amp:v*.8,dt}]; }
  if(a.k==='blow')return [{k:'blow',hz:a.n?imHz(a.n):0,pr:a.pr||0,dt}];
  if(a.k==='hit'){
    if(I.lay==='drums'){ const D=I.parts[a.i]; if(!D)return []; const r=Math.max(0,Math.min(.95,a.r??.3)), modes=[];
      if(D.k==='head'){ IMR.membrane.forEach(([q],j)=>{ const [m,jz]=IMJ[j]; let w=Math.abs(imBessel(m,jz*r))/(m?.58:1); if(!m)w=Math.max(w,.08); modes.push([D.f*q*(1+.012*j),D.t*Math.pow(.72,j),.16*v*w*imMallet(D.f*q,.0011)]); });
        const ev={k:'hit',modes,tau:.001,id:a.i,dt}; if(D.click)modes.push([D.f*28,.012,.08*v],[D.f*61,.008,.05*v]);
        if(D.wires)ev.noise=[.35*v,.22,1800,9000]; else if(D.click)ev.noise=[.25*v,.02,600,4000]; else ev.noise=[.08*v,.04,300,2500]; return [ev]; }
      if(D.k==='cym'&&r<.2){ const bm=[]; for(let j=0;j<8;j++)bm.push([D.f*3.1*Math.pow(j+1,1.25)*(1+.07*Math.sin(j*3.1)),D.t*.6*Math.pow(.8,j),.16*v/(j+1)]); return [{k:'hit',modes:bm,noise:[.1*v,.3,4000,14000],tau:.0003,id:a.i,dt}]; }
      const n=D.k==='hat'?18:26, modes2=[]; for(let j=0;j<n;j++){ const q=Math.pow(j+1,1.35)*(1+.11*Math.sin(j*7.13)); modes2.push([D.f*q,D.t*Math.pow(.86,j)*(a.open?8:1),.12*v/Math.sqrt(j+1)]); }
      return [{k:'hit',modes:modes2,noise:[(D.k==='hat'?.5:.35)*v,D.t*(a.open?6:.8),2500,14000],tau:.0005,ch:D.k==='hat'?1:null,id:a.i,dt}]; }
    const m=I.notes[a.i]; if(m==null)return []; let f=imHz(m); if(I.lay==='bells')f=2*f/8.933;
    const t1=I.t60(m), modes=I.modes.map((q,j)=>{ const ff=f*q; let w=imMallet(ff,I.tau)*(I.lay==='bells'?[.4,.5,.7,1,.9,.7][j]:1/(1+j*.6)); return [ff,t1*Math.pow(I.lay==='bells'?.8:.45,j),.45*v*w]; });
    if(I.res)modes.push([f,t1*1.6,.25*v]);
    return [{k:'hit',modes,tau:I.tau,id:a.i,dt,noise:[.04*v,.006,800,6000]}]; }
  return []; }
function imBessel(m,x){ let s=0, t=Math.pow(x/2,m); for(let k=1;k<=m;k++)t/=k; for(let k=0;k<30;k++){ s+=t; t*=-(x*x/4)/((k+1)*(k+1+m)); if(Math.abs(t)<1e-9)break; } return s; }
function imMallet(f,tau){ const x=2*f*tau; if(Math.abs(1-x)<1e-4)return Math.PI/4; return Math.abs(Math.cos(Math.PI*f*tau)/(1-x*x)); }
const IMCH=[['',[0,4,7]],['m',[0,3,7]],['7',[0,4,7,10]],['maj7',[0,4,7,11]],['m7',[0,3,7,10]],['mMaj7',[0,3,7,11]],['dim',[0,3,6]],['dim7',[0,3,6,9]],['m7b5',[0,3,6,10]],
  ['aug',[0,4,8]],['aug7',[0,4,8,10]],['augMaj7',[0,4,8,11]],['sus4',[0,5,7]],['sus2',[0,2,7]],['5',[0,7]]];
function imChordName(ms){ '@later'; if(!ms.length)return ''; const pcs=[...new Set(ms.map(m=>((m%12)+12)%12))].sort((a,b)=>a-b), bass=Math.min(...ms)%12;
  if(pcs.length===1)return IMNOTE[pcs[0]];
  for(const r of [bass,...pcs.filter(p=>p!==bass)])for(const [n,iv] of IMCH){ const set=iv.map(i=>(r+i)%12).sort((a,b)=>a-b); if(set.length===pcs.length&&set.every((v,i)=>v===pcs[i]))return IMNOTE[r]+n+(r!==bass?'/'+IMNOTE[bass]:''); }
  return ''; }
function imShape(I,root,iv,capo=0){ '@later'; const n=I.open.length, pcs=iv.map(i=>(root+i)%12), best={sc:-1e9,sh:null}, cur=[];
  const opt=I.open.map((o,s)=>{ const r=[-1]; for(let f=0;f<=5;f++){ if(I.fifth&&s===4&&f>0&&f+capo<I.fifth)continue; if(pcs.includes((o+capo+f)%12))r.push(f); } return r; });
  const score=sh=>{ const on=sh.map((f,s)=>f<0?null:I.open[s]+capo+f); const sounding=on.filter(v=>v!=null); if(sounding.length<Math.min(3,n))return -1e9;
    const low=Math.min(...sounding); if(low%12!==root)return -1e9; const have=new Set(sounding.map(v=>v%12)); for(const p of pcs)if(!have.has(p)&&!(iv.length>3&&p===(root+7)%12))return -1e9;
    const fr=sh.filter(f=>f>0); if(fr.length){ const lo=Math.min(...fr), hi=Math.max(...fr); if(hi-lo>3)return -1e9; const bar=fr.filter(f=>f===lo).length>1?1:0, fingers=fr.length-(bar?fr.filter(f=>f===lo).length-1:0); if(fingers>4)return -1e9; }
    const idx=sh.map((f,s)=>f<0?-1:s).filter(s=>s>=0), gaps=idx.length?sh.slice(Math.min(...idx),Math.max(...idx)+1).filter(f=>f<0).length:0;
    return sounding.length*3+sh.filter(f=>f===0).length*1.2-gaps*6-(fr.length?Math.max(...fr):0)*.6; };
  const walk=s=>{ if(s===n){ const v=score(cur); if(v>best.sc){ best.sc=v; best.sh=cur.slice(); } return; } for(const f of opt[s]){ cur[s]=f; walk(s+1); } };
  walk(0); return best.sh; }
window.__im={IMK,imAct,imChordName,imShape,imHz,imName};
