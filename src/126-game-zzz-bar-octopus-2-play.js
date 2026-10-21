const OCT={t:0,g:0,gbar:0,last:-1,src:null,hits:{L:[],R:[],K:[],A:[],B:[]},mood:'groove',puff:{next:4000,at:-1e9},sip:{next:9000,at:-1e9},lev:.85,cig:null,slo:{th:0,w:0,px:null,vx:0},hat:false,pics:new Map(),key:'',cur:null,L:[1,1,1],lk:'',lightAt:-1e9,b:{octo:true,inst:true,playing:true,c:{name:'the drummer',dress:''}}};
const OCTBK=.8, OCTD=(()=>{ const sp=IMKITBAR.sp, k=IMKITBAR.k, at=(dx,dy,z)=>[(dy*sp+OCTBK)*24,-dx*sp*24,z*k]; return [at(0,0,2),at(-.42,-.1,20),at(-.12,.12,30),at(.14,.12,31),at(.46,-.08,15),at(-.62,0,22),at(-.42,.34,40),at(.56,.3,36)]; })();
const OCTG={rock:{beats:4,sub:2,bpm:104,kick:'X...XX..',sn:'..X...X.',hat:'xxxxxxxx'},
  funk:{beats:4,sub:4,bpm:96,kick:'X..X..X...X..X..',sn:'....X..o.o..X..o',hat:'x.x.X.x.x.x.X.x.'},
  swing:{beats:4,sub:3,bpm:150,kick:'o.....o.....',sn:'.....o....o.',ride:'X..x.xX..x.x',foot:'...x.....x..',snH:'L'},
  bossa:{beats:4,sub:4,bpm:132,kick:'X..xX..xX..xX..x',rim:'X..X..X...X..X..',hat:'x.x.x.x.x.x.x.x.'},
  waltz:{beats:3,sub:2,kick:'X.....',hat:'..x.x.',sn:'....o.',soft:.6},
  pop:{beats:4,sub:2,kick:'X...X...',sn:'..x...x.',hat:'xxxxxxxx',soft:.6},
  ballad:{beats:4,sub:2,kick:'o.......',ride:'x.x.x.x.',foot:'..x...x.',soft:.45,snH:'L'},
  ballad3:{beats:3,sub:2,kick:'o.....',ride:'x.x.x.',foot:'..x.x.',soft:.45,snH:'L'}};
const OCTALONE=['rock','funk','swing','bossa'];
OCTG.g_funk={beats:4,sub:4,bpm:96,v:[[0,'K','X..x..X...x..x..'],[1,'L','....X..o.o..X..o'],[5,'A','x.x.X.x.x.x.X.x.'],[3,'R','..............o.']]};
OCTG.g_slow={beats:4,sub:4,bpm:80,soft:.8,v:[[0,'K','X.......x.X.....'],[1,'R','........X.......'],[7,'B','x.x.x.x.x.x.x.x.'],[5,'F','....x.......x...'],[1,'L','...o.....o....o.']]};
OCTG.g_rock={beats:4,sub:2,bpm:110,v:[[0,'K','X...XX..'],[1,'R','..X...X.'],[5,'A','xxxxxxxx'],[7,'B','X.......']]};
OCTG.g_swing={beats:4,sub:3,bpm:152,soft:.85,v:[[7,'B','X..x.xX..x.x'],[5,'F','...x.....x..'],[1,'L','.....o....o.'],[0,'K','o.....o.....']]};
OCTG.g_bossa={beats:4,sub:4,bpm:132,soft:.85,v:[[0,'K','X..xX..xX..xX..x'],[1,'L','X..X..X...X..X..'],[5,'A','x.x.x.x.x.x.x.x.'],[7,'B','..x...x...x...x.']]};
OCTG.g_solo={beats:4,sub:4,bpm:104};
const OCTSET=[{m:'groove',g:'g_funk',bars:8},{m:'groove',g:'g_slow',bars:8},{m:'groove',g:'g_rock',bars:8},{m:'solo',g:'g_solo',bars:8},
  {m:'groove',g:'g_swing',bars:8},{m:'groove',g:'g_bossa',bars:8},{m:'groove',g:'g_slow',bars:8},{m:'solo',g:'g_solo',bars:8}];
const octV=c=>c==='X'?1:c==='x'?.72:c==='o'?.36:0;
function octGrooveStep(G,bar,i,bars){ '@later'; const per=G.beats*G.sub, fl=bar%4===3?(bar===bars-1?2:1)*G.sub:0, out=[];
  if(fl&&i>=per-fl){ const k=i-(per-fl), seq=G.sub===3?[1,2,3,3,4,4]:G.sub===2?[1,2,3,4]:[1,1,2,2,3,3,4,4], d=seq[Math.floor(k*seq.length/fl)]; out.push([d,k%2?'L':'R',k===0?.95:.75]); if(i===per-1)out.push([0,'K',.9]); return out; }
  for(const [d,h,st] of G.v){ const v=octV(st[i%st.length]); if(v)out.push([d,h,v]); }
  if(bar%4===0&&i===0&&bar>0)out.push([6,'A',.85]);
  return out; }
function octSoloStep(bar,i){ '@later'; const b=bar%8, out=[], acc=i%4===0;
  if(b<2){ const H='RLRRLRLLRLRRLRLL'; out.push([1,H[i],acc?.95:.38]); if(i%2===0)out.push([5,'A',i%4===0?.7:.45]); if('X.....x.X.......'[i]!=='.')out.push([0,'K',.85]); }
  else if(b<4){ if(i<8){ out.push([[2,2,3,3,2,3,4,4][i],i%2?'L':'R',acc?.95:.7]); if(i%4===0)out.push([0,'K',.8]); } else { if(i%2===0)out.push([4,'B',i===8?1:.8]); if(i===8)out.push([6,'A',.9],[0,'K',1]); } }
  else if(b<6){ const H='LRAB', D=[1,2,5,4]; out.push([D[i%4],H[i%4],acc?.95:.62]); if(i%8===0)out.push([0,'K',.9]); }
  else if(b===6){ out.push([[2,2,2,3,3,3,3,4,4,4,4,4,1,1,1,1][i],i%2?'L':'R',acc?.95:.66]); if(i===0)out.push([6,'A',1]); if(i%4===0)out.push([0,'K',.75]); }
  else{ if(i===0||i===6||i===12)out.push([6,'A',1],[7,'B',.95],[1,'L',1],[0,'K',1]); if(i===14||i===15)out.push([1,i===14?'R':'L',.8]); }
  return out; }
function octStep(dt,now){ '@later'; const N=imxNode('bar','drum kit');
  if(OCT.src!=='alone'){ OCT.t=0; OCT.last=-1; OCT.g=0; OCT.src='alone'; }
  let E=OCTSET[OCT.g%OCTSET.length], G=OCTG[E.g]; OCT.mood=E.m; let spb=60/G.bpm/G.sub; OCT.t+=dt; const t=OCT.t;
  OCT.spb=spb; OCT.beats=G.beats; OCT.sub=G.sub; OCT.tnow=t;
  const per=G.beats*G.sub, upto=Math.floor((t+.12)/spb);
  for(let s=Math.max(0,OCT.last+1);s<=upto;s++){ OCT.last=s; const bar=Math.floor(s/per), i=s%per, at=s*spb, delay=Math.max(0,at-t), when=now+delay*1000;
    if(bar>=E.bars&&i===0){ OCT.g++; OCT.t-=bar*per*spb; OCT.last=0; E=OCTSET[OCT.g%OCTSET.length]; G=OCTG[E.g]; OCT.mood=E.m; spb=60/G.bpm/G.sub; octHit(N,6,'A',1,when,delay,.3); octHit(N,0,'K',1,when,delay); break; }
    const soft=G.soft||1; for(const [d,h,v] of E.m==='solo'?octSoloStep(bar,i):octGrooveStep(G,bar,i,E.bars))octHit(N,d,h==='F'?null:h,v*soft,when,delay,d===1?.3:d===5?.4:.45); } }
function octHit(N,i,hand,v,when,delay,r=.3){ if(N)imxSend(N,imAct('drum kit',{k:'hit',i,v,r,dt:Math.min(1,delay)}));
  if(hand){ const q=OCT.hits[hand]; q.push({at:when,i}); if(q.length>24)q.shift(); } }
const octPh=(o,now)=>{ const k=(now-o.at)/3200; return k>=0&&k<1?k:-1; };
function octHabits(now){ '@later'; const solo=OCT.mood==='solo';
  if(!solo&&now>OCT.puff.next&&octPh(OCT.sip,now)<0){ OCT.puff.at=now; OCT.puff.next=now+7000+hash3(Math.floor(now/1000),1,741)*5000; }
  if(!solo&&now>OCT.sip.next&&octPh(OCT.puff,now)<0&&OCT.lev>.05){ OCT.sip.at=now; OCT.sip.next=now+10000+hash3(Math.floor(now/1000),2,743)*6000; OCT.lev=Math.max(0,OCT.lev-.12); } }
const octUp=k=>k<0?0:Math.round((k<.3?k/.3:k<.7?1:(1-k)/.3)*4)/4;
function octPose(now){ '@later'; const st=hand=>{ const q=OCT.hits[hand]; let nx=null, ls=null; for(const h of q){ if(h.at>=now-5){ if(!nx||h.at<nx.at)nx=h; } else if(!ls||h.at>ls.at)ls=h; }
    let k=.7, i=nx?nx.i:ls?ls.i:hand==='L'?5:7; if(nx&&nx.at-now<140)k=(nx.at-now)/140; else if(ls&&now-ls.at<120){ k=(now-ls.at)/120*.7; i=ls.i; }
    return [i,Math.round(Math.max(0,Math.min(1,k))*3)]; };
  const kq=OCT.hits.K, kick=kq.some(h=>Math.abs(now-h.at)<70)?1:0, beat=OCT.spb?((OCT.tnow/(OCT.spb*(OCT.sub||2)))%1+1)%1:0;
  return {L:st('L'),R:st('R'),A:st('A'),B:st('B'),puff:octUp(octPh(OCT.puff,now)),sip:octUp(octPh(OCT.sip,now)),lev:Math.round(OCT.lev*10)/10,sl:Math.round(Math.tan(OCT.slo.th)*4)/4,
    kick,hat:OCT.hat?1:0,sw:Math.floor(((OCT.tnow||0)/((OCT.spb||.3)*(OCT.sub||2)))%2)*2,nod:beat<.25?1:0}; }
function octArms(p){ '@later'; const sh=[[4,7,26],[4,-7,26]], hand=(h,[i,k])=>{ const D=OCTD[i], S=sh[h==='L'?0:1], v=[S[0]-D[0],S[1]-D[1],S[2]-D[2]], l=Math.hypot(...v)||1, kk=k/3;
    const tip=[D[0]+v[0]/l*14,D[1]+v[1]/l*14,D[2]+v[2]/l*14+1], up=[tip[0]-2,tip[1],tip[2]+10], aimUp=[D[0],D[1],D[2]+16];
    return [[tip[0]+(up[0]-tip[0])*kk,tip[1]+(up[1]-tip[1])*kk,tip[2]+(up[2]-tip[2])*kk],[D[0],D[1],D[2]+1+(aimUp[2]-D[2]-1)*kk]]; };
  const kd=OCTD[0], hd=OCTD[5], Z=OCTSEAT, mix=(a,b,k)=>a.map((v,j)=>v+(b[j]-v)*k);
  if(p.A){ sh.push([-1,12,20],[-1,-12,20]); }
  const side=(h,s,ix)=>{ const D=OCTD[s[0]], S=sh[ix], v=[S[0]-D[0],S[1]-D[1],S[2]-D[2]], l=Math.hypot(...v)||1, kk=s[1]/3, tip=[D[0]+v[0]/l*14,D[1]+v[1]/l*14,D[2]+v[2]/l*14+1];
    return [[tip[0]-2*kk,tip[1],tip[2]+10*kk],[D[0],D[1],D[2]+1+15*kk]]; };
  const o={LS:hand('L',p.L),RS:hand('R',p.R),RF:[kd[0]-1,kd[1]-2,p.kick?1:4],LF:[hd[0]-1,hd[1],p.hat?4:1],sway:p.sw/4,nod:p.nod*2};
  if(p.A){ o.XA=side('A',p.A,2); o.XB=side('B',p.B,3); }
  o.CG=mix([1,15*OCTS,Z+9],[9.4,2.6,Z+10],p.puff); o.CGA=mix([.5,1,.55],[.45,1,.05],p.puff);
  o.GL=mix([1,-15*OCTS,Z+7],[8.2,-5.2,Z+6],p.sip); o.GLP=p.sip*.55; o.LEV=p.lev; o.SL=p.sl;
  return o; }
window.__octo={paint:(A,H,r=1)=>pupPaint(octBody(A),H,OCTP,r,{S:120}),arms:p=>octArms(p)};
