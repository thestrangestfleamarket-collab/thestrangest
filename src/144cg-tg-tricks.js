// THE CAFÉ'S TRICK AND RUMMY GAMES (TG, 144cc): Hearts, Spades, Euchre, Contract Bridge, Gin Rummy, Rummy, Cribbage and Texas Hold'em for play chips, each its rules, the computer's play and its table drawn for the window.
import {TG} from './144cc-tables.js';
TG.lib.push(()=>{ '@tables'; const D={};
  /* ---------- shared: the felt, hands around the table, tricks, the computer's trick play ---------- */
  const W=520, H=520, su=TG.suit, rk=TG.rank, lr=c=>(c%13+1)%13, pv=c=>Math.min(10,lr(c)+1), sum=a=>a.reduce((s,x)=>s+x,0), srt=a=>a.sort((x,y)=>x-y), rm=(a,c)=>{ const i=a.indexOf(c); if(i>=0)a.splice(i,1); return a; };
  const comb=(a,k)=>k===0?[[]]:a.length<k?[]:[...comb(a.slice(1),k-1).map(r=>[a[0],...r]),...comb(a.slice(1),k)];
  const POS={2:[0,2],3:[0,1,3],4:[0,1,2,3]}, posOf=(n,p,me)=>POS[n][((p-(me<0?0:me))%n+n)%n], SN=(p,me)=>p===me?'YOU':'P'+(p+1), rng=n=>[...Array(n).keys()];
  const bg=g=>{ TG.felt(g,W,H); g.save(); g.strokeStyle='#6a4426'; g.lineWidth=6; g.strokeRect(3,3,W-6,H-6); g.restore(); };
  const say=(g,t,y=380,s=14)=>TG.text(g,t,W/2,y,{b:1,s,c:'#f6dc90'});
  const panel=(g,L,x,y,right)=>{ L=L.filter(Boolean); if(!L.length)return; const w=Math.max(...L.map(t=>t.length))*7+12, bx=right?x-w:x; g.save(); g.fillStyle='rgba(20,12,6,.6)'; g.fillRect(bx,y,w,L.length*15+8); g.restore(); L.forEach((t,i)=>TG.text(g,t,bx+6,y+12+i*15,{s:11,a:'left'})); };
  const selOf=(ui,h)=>ui.sel=(Array.isArray(ui.sel)?ui.sel:[]).filter(c=>h.includes(c));
  const tog=(ui,h,c,max)=>{ const s=selOf(ui,h); if(c==null)return; if(s.includes(c))rm(s,c); else if(s.length<max)s.push(c); else if(max===1)s[0]=c; };
  // card rectangles of a hand at a place round the table: 0 the viewer's (bottom), 1 left, 2 top, 3 right
  const rects=(ps,L,up)=>{ const R=[]; if(ps===0){ const s=Math.min(36,(W-70)/Math.max(1,L-1)), x0=(W-((L-1)*s+44))/2; for(let i=0;i<L;i++)R.push([x0+i*s,H-68,44,62]); return R; }
    const s=up?Math.min(ps===2?22:26,(ps===2?300:310)/Math.max(1,L-1)):Math.min(12,160/Math.max(1,L-1));
    if(ps===2){ const x0=(W-((L-1)*s+30))/2; for(let i=0;i<L;i++)R.push([x0+i*s,10,30,42]); }
    else{ const y0=(H-((L-1)*s+42))/2-16, x=ps===1?8:W-38; for(let i=0;i<L;i++)R.push([x,y0+i*s,30,42]); } return R; };
  const seat=(g,n,p,me,cards,up,label,o={})=>{ const ps=posOf(n,p,me), R=rects(ps,cards.length,up);
    cards.forEach((c,i)=>{ const [x,y,w,h]=R[i]; TG.card(g,x,y,c,up,{w,h,sel:o.sel&&o.sel.includes(c),dim:o.dim&&o.dim(c)}); });
    const t=label+(up||!cards.length?'':' ·'+cards.length), w=t.length*7+10; let [lx,ly]=ps===0?[W/2,H-84]:ps===2?[W/2,62]:[ps===1?24:W-24,(R.length?R[0][1]:200)-10]; lx=Math.max(w/2+4,Math.min(W-w/2-4,lx));
    if(o.turn){ g.save(); g.fillStyle='rgba(224,160,32,.9)'; g.fillRect(lx-w/2,ly-8,w,16); g.restore(); }
    TG.text(g,t,lx,ly,{s:11,b:1,c:o.turn?'#2a1c12':'#f1e6c8'}); };
  const hitHand=(cards,ps,up,x,y)=>{ const R=rects(ps,cards.length,up); for(let i=R.length-1;i>=0;i--){ const [a,b,w,h]=R[i]; if(x>=a&&x<a+w&&y>=b-8&&y<b+h)return cards[i]; } return null; };
  const inR=(x,y,r)=>x>=r[0]&&x<r[0]+r[2]&&y>=r[1]&&y<r[1]+r[3];
  const TP={0:[238,284],1:[166,222],2:[238,160],3:[310,222]};
  const trick=(g,n,me,ld,cs,dim)=>cs.forEach((c,i)=>{ const [x,y]=TP[posOf(n,(ld+i)%n,me)]; TG.card(g,x,y,c,true,{dim}); });
  const showTrick=(g,S,me)=>{ if(S.tr.length)trick(g,4,me,S.ld,S.tr); else if(S.lt)trick(g,4,me,S.lt[0],S.lt.slice(1),true); };
  const winIdx=(cs,eff,r,t)=>{ let b=0; for(let i=1;i<cs.length;i++){ const c=cs[i], d=cs[b]; if(eff(c)===eff(d)?r(c)>r(d):eff(c)===t)b=i; } return b; };
  const follow=(h,tr,eff)=>{ if(!tr.length)return h.slice(); const f=h.filter(c=>eff(c)===eff(tr[0])); return f.length?f:h.slice(); };
  // the computer in a trick game: lead a sure winner or low from the longest suit; win as cheaply as it can unless partner already has it; else throw the lowest
  const trickAI=o=>{ const {legal:L,tr,eff,r,t}=o, isT=c=>eff(c)===t, low=a=>a.slice().sort((x,y)=>isT(x)-isT(y)||r(x)-r(y))[0], hi=a=>a.reduce((b,c)=>r(c)>r(b)?c:b), master=c=>!o.out.some(d=>eff(d)===eff(c)&&r(d)>r(c));
    if(L.length===1)return L[0];
    if(!tr.length){ const m=L.filter(c=>!isT(c)&&master(c)); if(m.length)return hi(m); const side=L.filter(c=>!isT(c)); if(!side.length)return hi(L);
      const len=s=>o.hand.filter(c=>eff(c)===s).length; return side.sort((x,y)=>len(eff(y))-len(eff(x))||r(x)-r(y))[0]; }
    const w=(o.ld+winIdx(tr,eff,r,t))%o.n, wins=L.filter(c=>winIdx([...tr,c],eff,r,t)===tr.length), rest=L.filter(c=>!wins.includes(c));
    if(w===o.part)return low(rest.length?rest:L);
    if(wins.length){ if(tr.length===o.n-1)return low(wins); const m=wins.filter(master); return low(m.length?m:wins); }
    return low(L); };
  const most=(sc,name,low)=>{ const b=low?Math.min(...sc):Math.max(...sc), w=rng(sc.length).filter(p=>sc[p]===b); return {win:w.length===sc.length?[]:w,text:(w.length===sc.length?'ALL TIED':w.map(p=>name(p)).join(' AND ')+(w.length>1?' TIE':' WINS'))+' WITH '+b+'.'}; };
  const PN=p=>'PLAYER '+(p+1);

  /* ---------- HEARTS: pass three, the 2♣ leads, follow suit; each heart 1, the Q♠ 13; all 26 shoots the moon; at 50 the lowest wins ---------- */
  const QS=49, hp=c=>su(c)===2?1:c===QS?13:0, hDir=n=>[1,3,2,0][n%4], DIR=['','LEFT','ACROSS','RIGHT'];
  const hGo=S=>{ S.ph='play'; S.ld=S.p=S.h.findIndex(h=>h.includes(0)); };
  const hDeal=(S,rnd)=>{ const d=TG.deck(rnd); S.h=[0,1,2,3].map(p=>srt(d.slice(p*13,p*13+13))); S.tk=[0,0,0,0]; S.tr=[]; S.lt=null; S.hb=0; S.ft=1; S.mo=-1; S.ps=[[],[],[],[]]; if(hDir(S.hn)){ S.ph='pass'; S.p=0; } else hGo(S); };
  const hLegal=S=>{ const h=S.h[S.p]; if(!S.tr.length){ if(S.ft)return [0]; const o=h.filter(c=>su(c)!==2); return S.hb||!o.length?h.slice():o; }
    const f=follow(h,S.tr,su); if(S.ft&&su(f[0])!==su(S.tr[0])){ const q=f.filter(c=>!hp(c)); if(q.length)return q; } return f; };
  D.hearts={name:'Hearts',kind:'cards',min:4,max:4,help:'Pass three cards, then follow suit if you can; the two of clubs leads. Each heart you take is a point and the queen of spades 13; take all 26 to shoot the moon. When someone reaches 50 the lowest score wins.',
    init:(n,rnd)=>{ const S={p:0,hn:0,sc:[0,0,0,0]}; hDeal(S,rnd); return S; },
    moves:S=>S.ph==='pass'?comb(S.h[S.p],3).map(c=>['P',...c]):S.ph==='play'?hLegal(S):S.ph==='end'?['N']:[],
    play:(S,m)=>{ if(m==='N'){ hDeal(S,TG.rng(S)); return S; }
      if(Array.isArray(m)){ const c=m.slice(1); S.ps[S.p]=c; c.forEach(x=>rm(S.h[S.p],x)); if(++S.p===4){ const d=hDir(S.hn); S.ps.forEach((c,q)=>S.h[(q+d)%4].push(...c)); S.h.forEach(srt); S.ps=[[],[],[],[]]; hGo(S); } return S; }
      rm(S.h[S.p],m); S.tr.push(m); S.lt=null; if(su(m)===2)S.hb=1; if(S.tr.length<4){ S.p=(S.p+1)%4; return S; }
      const w=(S.ld+winIdx(S.tr,su,rk,-1))%4; S.tk[w]+=sum(S.tr.map(hp)); S.lt=[S.ld,...S.tr]; S.tr=[]; S.ld=S.p=w; S.ft=0;
      if(!S.h[w].length){ const mo=S.tk.indexOf(26); S.sc=S.sc.map((v,q)=>v+(mo<0?S.tk[q]:q===mo?0:26)); S.mo=mo; S.hn++; S.ph=Math.max(...S.sc)>=50||S.hn>=12?'over':'end'; }
      return S; },
    over:S=>S.ph==='over'?most(S.sc,PN,1):null,
    ai:S=>{ const h=S.h[S.p]; if(S.ph==='end')return 'N';
      if(S.ph==='pass'){ const ns=h.filter(c=>su(c)===3&&rk(c)<10).length, v=c=>rk(c)+(c===QS?(ns<4?20:0):su(c)===3&&rk(c)>10?(ns<4?14:-4):0)+(su(c)===2?4:0)+(h.filter(d=>su(d)===su(c)).length<=2?3:0); return ['P',...srt(h.slice().sort((a,b)=>v(b)-v(a)).slice(0,3))]; }
      const L=hLegal(S); if(L.length===1)return L[0];
      const qOut=S.h.some((o,q)=>q!==S.p&&o.includes(QS)), hi=a=>a.reduce((b,c)=>rk(c)>rk(b)?c:b), lo=a=>a.reduce((b,c)=>rk(c)<rk(b)?c:b);
      if(!S.tr.length){ const c=L.filter(c=>su(c)!==2&&!(su(c)===3&&rk(c)>=10&&(qOut||c===QS))); return lo(c.length?c:L); }
      const ls=su(S.tr[0]), top=S.tr.filter(c=>su(c)===ls).reduce((b,c)=>rk(c)>rk(b)?c:b);
      if(su(L[0])===ls){ const under=L.filter(c=>rk(c)<rk(top)); if(under.length)return hi(under); const safe=L.filter(c=>c!==QS), a=safe.length?safe:L; return S.tr.length===3&&!sum(S.tr.map(hp))?hi(a):lo(a); }
      if(L.includes(QS))return QS; const hs=L.filter(c=>su(c)===2); if(hs.length)return hi(hs); const bs=L.filter(c=>su(c)===3&&rk(c)>10); if(qOut&&bs.length)return hi(bs); return hi(L); },
    status:S=>S.ph==='pass'?'PASS THREE CARDS '+DIR[hDir(S.hn)]+'.':S.ph==='end'?'THE HAND IS OVER.':S.ft&&!S.tr.length?'THE TWO OF CLUBS LEADS.':'PLAY A CARD'+(S.hb?'.':'; HEARTS ARE NOT BROKEN.'),
    draw:(g,S,me,ui)=>{ bg(g); const my=me>=0&&S.p===me, sel=me>=0&&S.ph==='pass'?selOf(ui,S.h[me]):[], L=my&&S.ph==='play'?hLegal(S):null;
      for(let p=0;p<4;p++)seat(g,4,p,me,S.h[p],p===me,SN(p,me)+' '+S.sc[p]+(S.tk[p]?' +'+S.tk[p]:''),{turn:S.p===p&&(S.ph==='play'||S.ph==='pass'),sel:p===me?sel:null,dim:p===me&&L?c=>!L.includes(c):null});
      showTrick(g,S,me); panel(g,['HAND '+(S.hn+(S.ph==='end'||S.ph==='over'?0:1)),'GAME TO 50'],48,66);
      if(S.ph==='pass'){ say(g,'PASS THREE '+DIR[hDir(S.hn)],250,18); if(my)TG.btn(g,ui,'pass',W/2-70,388,140,30,'PASS ('+sel.length+'/3)',sel.length===3); else if(me>=0&&S.ps[me].length)say(g,'WAITING FOR THE OTHERS.'); }
      if(S.ph==='end'||S.ph==='over'){ say(g,S.mo>=0?SN(S.mo,me)+' SHOT THE MOON!':'HAND '+S.hn+' DONE.',372); if(S.ph==='end'&&my)TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT HAND'); } },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y); if(b==='next')return 'N'; const c=hitHand(S.h[me],0,true,x,y);
      if(S.ph==='pass'){ const s=selOf(ui,S.h[me]); if(b==='pass'&&s.length===3)return ['P',...srt(s.slice())]; tog(ui,S.h[me],c,3); return null; }
      return S.ph==='play'?c:null; }};

  /* ---------- SPADES: partners P1+P3 against P2+P4 bid their tricks (0 is nil); spades trump and wait to be broken; ten bags cost 100; to 200 or six hands ---------- */
  const spDeal=(S,rnd)=>{ const d=TG.deck(rnd); S.h=[0,1,2,3].map(p=>srt(d.slice(p*13,p*13+13))); S.bd=[-1,-1,-1,-1]; S.tk=[0,0,0,0]; S.tr=[]; S.lt=null; S.sb=0; S.ph='bid'; S.p=(S.dl+1)%4; };
  const spLegal=S=>{ const h=S.h[S.p]; if(!S.tr.length){ const o=h.filter(c=>su(c)!==3); return S.sb||!o.length?h.slice():o; } return follow(h,S.tr,su); };
  const spEst=h=>{ let e=0; const L=[0,1,2,3].map(s=>h.filter(c=>su(c)===s).length);
    for(const c of h){ const s=su(c), r=rk(c); if(s===3){ if(r===12)e+=1; else if(r===11)e+=L[3]>=2?1:.4; else if(r===10)e+=L[3]>=3?.7:.2; }
      else if(r===12)e+=L[s]<=5?1:.6; else if(r===11)e+=L[s]>=2&&L[s]<=4?.7:.2; else if(r===10&&L[s]>=3&&L[s]<=4)e+=.25; }
    e+=Math.max(0,L[3]-3); for(let s=0;s<3;s++){ if(!L[s]&&L[3]>=3)e+=1; else if(L[s]===1&&L[3]>=2)e+=.5; } return e; };
  const TM=['P1+P3','P2+P4'];
  D.spades={name:'Spades',kind:'cards',min:4,max:4,help:'Partners sit across. Each bids the tricks they will take (nil bets on none); spades are trump and cannot be led until one is played. A made bid scores 10 a trick, each extra trick (a bag) 1, and ten bags cost 100. First team to 200, or the best after six hands.',
    init:(n,rnd)=>{ const S={p:0,dl:3,hn:0,sc:[0,0],bg:[0,0],ls:null}; spDeal(S,rnd); return S; },
    moves:S=>S.ph==='bid'?rng(14):S.ph==='play'?spLegal(S):S.ph==='end'?['N']:[],
    play:(S,m)=>{ if(m==='N'){ S.dl=(S.dl+1)%4; spDeal(S,TG.rng(S)); return S; }
      if(S.ph==='bid'){ S.bd[S.p]=m; S.p=(S.p+1)%4; if(S.bd.every(b=>b>=0)){ S.ph='play'; S.ld=S.p=(S.dl+1)%4; } return S; }
      rm(S.h[S.p],m); S.tr.push(m); S.lt=null; if(su(m)===3)S.sb=1; if(S.tr.length<4){ S.p=(S.p+1)%4; return S; }
      const w=(S.ld+winIdx(S.tr,su,rk,3))%4; S.tk[w]++; S.lt=[S.ld,...S.tr]; S.tr=[]; S.ld=S.p=w;
      if(!S.h[w].length){ S.ls=[0,0]; for(const t of [0,1]){ let d=0, con=0, got=0; for(const q of [t,t+2]){ if(S.bd[q]===0)d+=S.tk[q]?-100:100; else{ con+=S.bd[q]; got+=S.tk[q]; } }
          if(got>=con){ d+=10*con+got-con; S.bg[t]+=got-con; if(S.bg[t]>=10){ S.bg[t]-=10; d-=100; } } else d-=10*con; S.sc[t]+=d; S.ls[t]=d; }
        S.hn++; S.ph=Math.max(...S.sc)>=200||S.hn>=6?'over':'end'; }
      return S; },
    over:S=>S.ph!=='over'?null:S.sc[0]===S.sc[1]?{win:[],text:'A DRAW AT '+S.sc[0]+'.'}:(t=>({win:[t,t+2],text:'PLAYERS '+(t+1)+' AND '+(t+3)+' WIN, '+S.sc[t]+' TO '+S.sc[1-t]+'.'}))(S.sc[0]>S.sc[1]?0:1),
    ai:S=>{ const p=S.p, h=S.h[p]; if(S.ph==='end')return 'N';
      if(S.ph==='bid'){ const e=spEst(h); if(e<1.2&&S.bd[(p+2)%4]!==0&&!h.some(c=>su(c)===3&&rk(c)>=9||rk(c)===12)&&h.filter(c=>su(c)===3).length<=3)return 0; return Math.max(1,Math.min(13,Math.round(e))); }
      const L=spLegal(S), byR=a=>a.slice().sort((x,y)=>(su(x)===3)-(su(y)===3)||rk(x)-rk(y));
      if(S.bd[p]===0){ if(!S.tr.length)return byR(L)[0]; const lose=L.filter(c=>winIdx([...S.tr,c],su,rk,3)!==S.tr.length); return lose.length?lose.reduce((b,c)=>rk(c)>rk(b)?c:b):byR(L)[0]; }
      const pa=(p+2)%4; return trickAI({hand:h,legal:L,tr:S.tr,ld:S.ld,n:4,eff:su,r:rk,t:3,part:S.bd[pa]===0?-1:pa,out:S.h.filter((_,q)=>q!==p).flat()}); },
    status:S=>S.ph==='bid'?'BID YOUR TRICKS.':S.ph==='end'?'THE HAND IS OVER.':'PLAY A CARD'+(S.sb?'.':'; SPADES ARE NOT BROKEN.'),
    draw:(g,S,me,ui)=>{ bg(g); const my=me>=0&&S.p===me, L=my&&S.ph==='play'?spLegal(S):null;
      for(let p=0;p<4;p++)seat(g,4,p,me,S.h[p],p===me,SN(p,me)+(S.bd[p]>=0?' BID '+(S.bd[p]||'NIL'):'')+(S.ph!=='bid'?' WON '+S.tk[p]:''),{turn:S.p===p&&(S.ph==='bid'||S.ph==='play'),dim:p===me&&L?c=>!L.includes(c):null});
      showTrick(g,S,me); panel(g,[TM[0]+' '+S.sc[0]+' ('+S.bg[0]+' BAGS)',TM[1]+' '+S.sc[1]+' ('+S.bg[1]+' BAGS)','HAND '+Math.min(6,S.hn+(S.ph==='end'||S.ph==='over'?0:1))+' OF 6'],48,66);
      if(S.ls&&S.ph!=='play')panel(g,['LAST HAND',TM[0]+' '+(S.ls[0]>0?'+':'')+S.ls[0],TM[1]+' '+(S.ls[1]>0?'+':'')+S.ls[1]],472,66,1);
      if(S.ph==='bid'&&my){ say(g,'YOUR BID',222); for(let i=0;i<14;i++)TG.btn(g,ui,'b'+i,W/2-196+(i%7)*56,240+Math.floor(i/7)*32,52,28,i?String(i):'NIL'); }
      if(S.ph==='end'&&my)TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT HAND'); },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y); if(b==='next')return 'N'; if(S.ph==='bid')return b&&b[0]==='b'?+b.slice(1):null; return S.ph==='play'?hitHand(S.h[me],0,true,x,y):null; }};

  /* ---------- EUCHRE: 24 cards 9 to ace, partners; order up the turned card or name trump; the jacks of trump's colour are the bowers; 3 tricks score 1, all five 2, a euchre gives 2; to 10 ---------- */
  const EDK=rng(52).filter(c=>rk(c)>=7), LB={0:3,3:0,1:2,2:1};
  const eEff=t=>c=>rk(c)===9&&su(c)===LB[t]?t:su(c), eRk=t=>c=>rk(c)!==9?rk(c):su(c)===t?20:su(c)===LB[t]?19:9;
  const eDeal=(S,rnd)=>{ const d=TG.shuffle(EDK.slice(),rnd); S.h=[0,1,2,3].map(p=>srt(d.slice(p*5,p*5+5))); S.ki=d.slice(20); S.up=S.ki[0]; S.ts=-1; S.mk=-1; S.tk=[0,0,0,0]; S.tr=[]; S.lt=null; S.ph='ord1'; S.nb=0; S.p=(S.dl+1)%4; };
  const eLegal=S=>follow(S.h[S.p],S.tr,eEff(S.ts));
  const eStr=(h,t)=>sum(h.map(c=>{ const r=eRk(t)(c); return eEff(t)(c)===t?(r===20?3:r===19?2.5:r===12?2:r===11?1.6:r===10?1.3:1):rk(c)===12?.8:0; }));
  const eStart=S=>{ S.ph='play'; S.ld=S.p=(S.dl+1)%4; };
  D.euchre={name:'Euchre',kind:'cards',min:4,max:4,help:'Partners sit across; 24 cards, nine to ace. Order up the turned card as trump or pass; on the second round name another suit. The jack of trump is highest, then the other jack of its colour. The makers score 1 for three tricks and 2 for all five; fail and the others score 2. First to 10.',
    init:(n,rnd)=>{ const S={p:0,dl:3,hn:0,sc:[0,0],res:''}; eDeal(S,rnd); return S; },
    moves:S=>S.ph==='ord1'?['O','P']:S.ph==='disc'?S.h[S.p].slice():S.ph==='ord2'?[...[0,1,2,3].filter(s=>s!==su(S.up)).map(s=>'T'+s),...(S.p===S.dl?[]:['P'])]:S.ph==='play'?eLegal(S):S.ph==='end'?['N']:[],
    play:(S,m)=>{ if(m==='N'){ S.dl=(S.dl+1)%4; eDeal(S,TG.rng(S)); return S; }
      if(S.ph==='ord1'){ if(m==='O'){ S.ts=su(S.up); S.mk=S.p%2; S.h[S.dl].push(S.up); srt(S.h[S.dl]); S.ph='disc'; S.p=S.dl; } else if(++S.nb===4){ S.ph='ord2'; S.nb=0; S.p=(S.dl+1)%4; } else S.p=(S.p+1)%4; return S; }
      if(S.ph==='disc'){ rm(S.h[S.p],m); eStart(S); return S; }
      if(S.ph==='ord2'){ if(m==='P')S.p=(S.p+1)%4; else{ S.ts=+m[1]; S.mk=S.p%2; eStart(S); } return S; }
      rm(S.h[S.p],m); S.tr.push(m); S.lt=null; if(S.tr.length<4){ S.p=(S.p+1)%4; return S; }
      const w=(S.ld+winIdx(S.tr,eEff(S.ts),eRk(S.ts),S.ts))%4; S.tk[w]++; S.lt=[S.ld,...S.tr]; S.tr=[]; S.ld=S.p=w;
      if(!S.h[w].length){ const t=S.tk[S.mk]+S.tk[S.mk+2], k=S.mk; if(t>=3){ S.sc[k]+=t===5?2:1; S.res=TM[k]+(t===5?' TAKE ALL FIVE: 2.':' MAKE IT: 1.'); } else{ S.sc[1-k]+=2; S.res=TM[k]+' ARE EUCHRED: 2 TO '+TM[1-k]+'.'; }
        S.hn++; S.ph=Math.max(...S.sc)>=10||S.hn>=25?'over':'end'; }
      return S; },
    over:S=>S.ph!=='over'?null:S.sc[0]===S.sc[1]?{win:[],text:'A DRAW AT '+S.sc[0]+'.'}:(t=>({win:[t,t+2],text:'PLAYERS '+(t+1)+' AND '+(t+3)+' WIN, '+S.sc[t]+' TO '+S.sc[1-t]+'.'}))(S.sc[0]>S.sc[1]?0:1),
    ai:S=>{ const p=S.p, h=S.h[p]; if(S.ph==='end')return 'N';
      if(S.ph==='ord1'){ const t=su(S.up); let s; if(p===S.dl){ const hh=[...h,S.up]; s=eStr(hh,t)-Math.min(...hh.map(c=>eStr([c],t))); } else s=eStr(h,t)+((p+2)%4===S.dl?.6:-.4); return s>=5?'O':'P'; }
      if(S.ph==='ord2'){ let bs=-1, bv=-1; for(let t=0;t<4;t++)if(t!==su(S.up)){ const v=eStr(h,t); if(v>bv){ bv=v; bs=t; } } return bv>=5||p===S.dl?'T'+bs:'P'; }
      if(S.ph==='disc'){ const t=S.ts, keep=c=>eStr([c],t)*3+rk(c)/10+(eEff(t)(c)!==t&&h.filter(d=>eEff(t)(d)===eEff(t)(c)).length===1?-.5:0); return h.reduce((b,c)=>keep(c)<keep(b)?c:b); }
      return trickAI({hand:h,legal:eLegal(S),tr:S.tr,ld:S.ld,n:4,eff:eEff(S.ts),r:eRk(S.ts),t:S.ts,part:(p+2)%4,out:[...S.h.filter((_,q)=>q!==p).flat(),...S.ki.slice(1)]}); },
    status:S=>S.ph==='ord1'?'ORDER UP THE '+TG.cardName(S.up)+' AS TRUMP, OR PASS.':S.ph==='ord2'?'NAME A TRUMP SUIT'+(S.p===S.dl?' (THE DEALER MUST).':', OR PASS.'):S.ph==='disc'?'THE DEALER DISCARDS ONE.':S.ph==='end'?S.res:'PLAY A CARD.',
    draw:(g,S,me,ui)=>{ bg(g); const my=me>=0&&S.p===me, L=my&&S.ph==='play'?eLegal(S):null, ord=S.ph==='ord1'||S.ph==='ord2';
      for(let p=0;p<4;p++)seat(g,4,p,me,S.h[p],p===me,SN(p,me)+(p===S.dl?' DEALER':'')+(ord?'':' '+S.tk[p]),{turn:S.p===p&&S.ph!=='end'&&S.ph!=='over',dim:p===me&&L?c=>!L.includes(c):null});
      panel(g,[TM[0]+' '+S.sc[0],TM[1]+' '+S.sc[1],'GAME TO 10'],48,66);
      if(S.ts>=0)panel(g,['TRUMP '+TG.SUITS[S.ts],'MADE BY '+TM[S.mk]],472,66,1);
      if(ord){ if(S.ph==='ord1')TG.card(g,238,190,S.up,true); else TG.card(g,238,190,S.up,true,{dim:1}); say(g,S.ph==='ord1'?'THE TURNED CARD':'TURNED DOWN',268,12);
        if(my){ if(S.ph==='ord1'){ TG.btn(g,ui,'O',W/2-130,300,124,30,S.p===S.dl?'PICK IT UP':'ORDER UP'); TG.btn(g,ui,'P',W/2+6,300,124,30,'PASS'); }
          else{ [0,1,2,3].filter(s=>s!==su(S.up)).forEach((s,i)=>TG.btn(g,ui,'T'+s,W/2-150+i*76,300,70,30,TG.SUITS[s])); if(S.p!==S.dl)TG.btn(g,ui,'P',W/2+78,300,72,30,'PASS'); } } }
      else showTrick(g,S,me);
      if(S.ph==='disc'&&my)say(g,'CLICK A CARD TO DISCARD',372);
      if(S.ph==='end'||S.ph==='over'){ say(g,S.res,372,12); if(S.ph==='end'&&my)TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT HAND'); } },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y); if(b==='next')return 'N'; if(S.ph==='ord1'||S.ph==='ord2')return b;
      return S.ph==='play'||S.ph==='disc'?hitHand(S.h[me],0,true,x,y):null; }};

  /* ---------- CONTRACT BRIDGE: North-South against East-West; an auction 1♣ to 7NT with double and redouble; declarer plays the dummy face up; four deals, Chicago ---------- */
  const STR=['♣','♦','♥','♠','NT'], NS='NESW', bName=b=>typeof b==='number'?(Math.floor(b/5)+1)+STR[b%5]:b==='P'?'PASS':b==='X'?'DBL':'RDBL', lvl=b=>Math.floor(b/5)+1;
  const hcp=h=>sum(h.map(c=>Math.max(0,rk(c)-8))), bVul=(dn,t)=>dn===3||dn>0&&dn<3&&dn%2===t;
  const bDeal=(S,rnd)=>{ const d=TG.deck(rnd); S.h=[0,1,2,3].map(p=>srt(d.slice(p*13,p*13+13))); S.dl=S.dn%4; S.au=[]; S.ct=null; S.tr=[]; S.lt=null; S.tk=[0,0]; S.du=0; S.ph='bid'; S.p=S.dl; S.t=-1; };
  const lastBid=S=>{ for(let i=S.au.length-1;i>=0;i--)if(typeof S.au[i]==='number')return i; return -1; };
  const bMoves=S=>{ const i=lastBid(S), M=['P']; for(let b=(i<0?-1:S.au[i])+1;b<35;b++)M.push(b);
    let j=S.au.length-1; while(j>=0&&S.au[j]==='P')j--; if(j>=0&&((S.dl+j)%4+S.p)%2===1){ if(typeof S.au[j]==='number')M.push('X'); else if(S.au[j]==='X')M.push('R'); } return M; };
  const actor=S=>S.ct&&S.t===(S.ct.d+2)%4?S.ct.d:S.t;
  const bScore=(ct,made,vul)=>{ const L=lvl(ct.b), s=ct.b%5, need=L+6, x=ct.x, m=x===2?4:x?2:1;
    if(made>=need){ const tp=(s<2?20*L:30*L+(s===4?10:0))*m; return tp+(tp>=100?(vul?500:300):50)+(L===6?(vul?750:500):L===7?(vul?1500:1000):0)+50*x+(made-need)*(x?(vul?200:100)*x:(s<2?20:30)); }
    const u=need-made; if(!x)return -u*(vul?100:50); let pen=0; for(let i=1;i<=u;i++)pen+=vul?(i===1?200:300):(i===1?100:i<=3?200:300); return -pen*x; };
  const bEnd=(S,t)=>{ S.res=t; S.dn++; S.ph=S.dn>=4?'over':'end'; S.p=S.dn%4; };
  const bBid=S=>{ const p=S.p, h=S.h[p], pts=hcp(h), len=[0,1,2,3].map(s=>h.filter(c=>su(c)===s).length), bal=len.every(l=>l>=2)&&len.filter(l=>l===2).length<=1;
    const M=bMoves(S), ok=b=>M.includes(b), by=i=>(S.dl+i)%4, mine=S.au.filter((c,i)=>by(i)===p&&typeof c==='number'), pb=S.au.filter((c,i)=>by(i)===(p+2)%4&&typeof c==='number');
    const low=s=>{ for(let b=s;b<35;b+=5)if(ok(b))return b; return -1; }, long=[3,2,1,0].reduce((a,s)=>len[s]>len[a]?s:a,3);
    if(!mine.length&&!pb.length){ if(pts>=15&&pts<=17&&bal&&ok(4))return 4; if(pts>=12){ const b=low(long); if(b>=0&&lvl(b)<=(pts>=16?2:1)+(len[long]>=6?1:0))return b; } return 'P'; }
    if(pb.length&&!mine.length){ const q=pb[pb.length-1], qs=q%5; if(pts<6)return 'P';
      if(qs===4){ if(lvl(q)===1){ if(pts>=10&&ok(14))return 14; if(pts>=8&&ok(9))return 9; } return 'P'; }
      const sup=len[qs]>=(qs>=2?3:4), tot=pts+13+(sup?sum(len.map(l=>l===0?3:l===1?2:0)):0), tgt=tot>=26?(qs>=2?4:5):tot>=23?3:2;
      if(sup){ const b=low(qs); return b>=0&&lvl(b)<=tgt?b:'P'; }
      if(len[long]>=5){ const b=low(long); if(b>=0&&lvl(b)<=(pts>=10?2:1))return b; }
      if(tot>=26&&ok(14))return 14; return ok(4)?4:'P'; }
    if(pb.length){ const q=pb[pb.length-1], qs=q%5; if(qs<4&&len[qs]>=4&&mine[mine.length-1]%5!==qs){ const b=low(qs); if(b>=0&&lvl(b)<=3)return b; } }
    return 'P'; };
  D.bridge={name:'Contract Bridge',kind:'cards',min:4,max:4,help:'North and South play East and West. Bid how many tricks over six your side will take and in which trump (or no trump); the last bid is the contract. The declarer plays the dummy too, face up after the first lead. Four deals scored Chicago style; the most points wins.',
    init:(n,rnd)=>{ const S={p:0,dn:0,sc:[0,0],res:''}; bDeal(S,rnd); return S; },
    moves:S=>S.ph==='bid'?bMoves(S):S.ph==='play'?follow(S.h[S.t],S.tr,su):S.ph==='end'?['N']:[],
    play:(S,m)=>{ if(m==='N'){ bDeal(S,TG.rng(S)); return S; }
      if(S.ph==='bid'){ S.au.push(m); const A=S.au, k=A.length;
        if(k===4&&A.every(c=>c==='P')){ bEnd(S,'PASSED OUT: NO SCORE.'); return S; }
        if(k>=4&&A.slice(-3).every(c=>c==='P')){ const i=lastBid(S), b=A[i], tm=(S.dl+i)%2; let x=0; for(let j=i+1;j<k;j++)x=A[j]==='X'?1:A[j]==='R'?2:x;
          const j=A.findIndex((c,j)=>typeof c==='number'&&c%5===b%5&&(S.dl+j)%2===tm); S.ct={b,x,d:(S.dl+j)%4}; S.ph='play'; S.ld=S.t=(S.ct.d+1)%4; S.p=actor(S); return S; }
        S.p=(S.p+1)%4; return S; }
      rm(S.h[S.t],m); S.tr.push(m); S.du=1; S.lt=null;
      if(S.tr.length<4){ S.t=(S.t+1)%4; S.p=actor(S); return S; }
      const tr=S.ct.b%5<4?S.ct.b%5:-1, w=(S.ld+winIdx(S.tr,su,rk,tr))%4; S.tk[w%2]++; S.lt=[S.ld,...S.tr]; S.tr=[]; S.ld=S.t=w; S.p=actor(S);
      if(!S.h[w].length){ const tm=S.ct.d%2, v=bScore(S.ct,S.tk[tm],bVul(S.dn,tm)); S.sc[v>0?tm:1-tm]+=Math.abs(v);
        bEnd(S,bName(S.ct.b)+' BY '+NS[S.ct.d]+(v>0?' MADE: ':' DOWN '+(lvl(S.ct.b)+6-S.tk[tm])+': ')+Math.abs(v)+' TO '+(v>0?(tm?'E-W':'N-S'):(tm?'N-S':'E-W'))+'.'); }
      return S; },
    over:S=>S.ph!=='over'?null:S.sc[0]===S.sc[1]?{win:[],text:'A DRAW AT '+S.sc[0]+'.'}:S.sc[0]>S.sc[1]?{win:[0,2],text:'NORTH AND SOUTH WIN, '+S.sc[0]+' TO '+S.sc[1]+'.'}:{win:[1,3],text:'EAST AND WEST WIN, '+S.sc[1]+' TO '+S.sc[0]+'.'},
    ai:S=>{ if(S.ph==='end')return 'N'; if(S.ph==='bid')return bBid(S);
      return trickAI({hand:S.h[S.t],legal:follow(S.h[S.t],S.tr,su),tr:S.tr,ld:S.ld,n:4,eff:su,r:rk,t:S.ct.b%5<4?S.ct.b%5:-1,part:(S.t+2)%4,out:S.h.filter((_,q)=>q!==S.t).flat()}); },
    status:S=>S.ph==='bid'?'BID OR PASS.':S.ph==='end'?S.res:'PLAY '+(S.t!==S.p?'FROM THE DUMMY':'A CARD')+'. CONTRACT '+bName(S.ct.b)+(S.ct.x?' X'.repeat(S.ct.x):'')+' BY '+NS[S.ct.d]+'.',
    draw:(g,S,me,ui)=>{ bg(g); const ct=S.ct, dm=ct?(ct.d+2)%4:-1, play=S.ph==='play';
      for(let p=0;p<4;p++){ const up=p===me||S.du&&p===dm, mine=play&&S.t===p&&S.p===me&&me>=0, L=mine?follow(S.h[p],S.tr,su):null;
        seat(g,4,p,me,S.h[p],up,NS[p]+(p===me?' YOU':'')+(ct?(p===ct.d?' DECL':p===dm?' DUMMY':''):''),{turn:play?S.t===p:S.ph==='bid'&&S.p===p,dim:L?c=>!L.includes(c):null}); }
      panel(g,['DEAL '+Math.min(4,S.dn+(play||S.ph==='bid'?1:0))+' OF 4','N-S '+S.sc[0]+(bVul(S.dn%4,0)?' VUL':''),'E-W '+S.sc[1]+(bVul(S.dn%4,1)?' VUL':'')],48,66);
      if(S.ph==='bid'){ for(let i=0;i<4;i++)TG.text(g,NS[i],190+i*50,80,{b:1,s:12,c:'#f0c040'}); const rows=Math.floor((S.au.length+S.dl)/4), r0=Math.max(0,rows-3);
        S.au.forEach((c,i)=>{ const k=i+S.dl, row=Math.floor(k/4)-r0; if(row>=0)TG.text(g,bName(c),190+(k%4)*50,98+row*16,{s:11}); });
        if(me>=0&&S.p===me){ const M=bMoves(S); for(let b=0;b<35;b++)TG.btn(g,ui,'b'+b,100+(b%5)*64,166+Math.floor(b/5)*24,60,22,bName(b),M.includes(b));
          TG.btn(g,ui,'P',100,340,124,24,'PASS'); TG.btn(g,ui,'X',228,340,94,24,'DBL',M.includes('X')); TG.btn(g,ui,'R',326,340,94,24,'RDBL',M.includes('R')); }
        else say(g,NS[S.p]+' TO BID',250); }
      else{ if(ct)panel(g,[bName(ct.b)+(ct.x?' X'.repeat(ct.x):'')+' BY '+NS[ct.d],'N-S '+S.tk[0]+'  E-W '+S.tk[1]],472,66,1); showTrick(g,S,me);
        if(!play){ say(g,S.res,372,12); if(S.ph==='end'&&me===S.p)TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT DEAL'); } } },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y); if(b==='next')return 'N';
      if(S.ph==='bid')return !b?null:b[0]==='b'?+b.slice(1):b;
      if(S.ph!=='play'||S.p!==me)return null; if(S.t===me)return hitHand(S.h[me],0,true,x,y);
      const dm=(S.ct.d+2)%4; return S.t===dm?hitHand(S.h[dm],posOf(4,dm,me),true,x,y):null; }};

  /* ---------- melds for the rummies: sets of a rank, runs in a suit (ace low); the least deadwood ---------- */
  const mAll=h=>{ const M=[], R={}, U={}; for(const c of h){ (R[lr(c)]||(R[lr(c)]=[])).push(c); (U[su(c)]||(U[su(c)]=[])).push(c); }
    for(const k in R){ const g=R[k]; if(g.length>=3){ M.push(g.slice()); if(g.length===4)for(let i=0;i<4;i++)M.push(g.filter((_,j)=>j!==i)); } }
    for(const k in U){ const g=U[k].slice().sort((a,b)=>lr(a)-lr(b)); for(let i=0;i<g.length;i++){ let j=i; while(j+1<g.length&&lr(g[j+1])===lr(g[j])+1){ j++; if(j-i>=2)M.push(g.slice(i,j+1)); } } }
    return M; };
  const mBest=h=>{ const M=mAll(h); let best={d:1e9,m:[]};
    const go=(left,ms,d)=>{ if(d>=best.d)return; if(!left.length){ best={d,m:ms}; return; } const c=left[0];
      for(const m of M)if(m.includes(c)&&m.every(x=>left.includes(x)))go(left.filter(x=>!m.includes(x)),[...ms,m],d);
      go(left.slice(1),ms,d+pv(c)); };
    go(h.slice(),[],0); return best; };
  const fits=(m,c)=>{ if(lr(m[0])===lr(m[1]))return lr(c)===lr(m[0])&&m.length<4; if(su(c)!==su(m[0]))return false; const r=m.map(lr); return lr(c)===Math.min(...r)-1||lr(c)===Math.max(...r)+1; };
  const mSort=m=>m.sort((a,b)=>lr(a)-lr(b)||a-b);
  const PILE=[[196,186,44,62],[280,186,44,62]];
  const piles=(g,st,dp,y)=>{ const [a,b]=PILE; if(st.length)TG.card(g,a[0],y,0,false); else{ g.save(); g.strokeStyle='rgba(241,230,200,.4)'; g.strokeRect(a[0],y,44,62); g.restore(); }
    TG.text(g,'STOCK '+st.length,a[0]+22,y+74,{s:10}); if(dp.length)TG.card(g,b[0],y,dp[dp.length-1],true); TG.text(g,'DISCARD',b[0]+22,y+74,{s:10}); };

  /* ---------- GIN RUMMY: draw from the stock or the discard, then discard; knock with 10 or less deadwood, gin 25, undercut 25; to 100 ---------- */
  const gDeal=(S,rnd)=>{ const d=TG.deck(rnd); S.h=[srt(d.slice(0,10)),srt(d.slice(10,20))]; S.dp=[d[20]]; S.st=d.slice(21); S.ph='draw'; S.p=1-S.dl; S.nd=-1; S.ko=null; };
  const gMoves=S=>{ if(S.ph==='draw')return [...(S.st.length?['S']:[]),'D']; if(S.ph==='show')return ['N']; if(S.ph!=='disc')return [];
    const h=S.h[S.p], M=[]; for(const c of h)if(c!==S.nd){ M.push(c); if(mBest(h.filter(x=>x!==c)).d<=10)M.push(['K',c]); } return M; };
  D.gin={name:'Gin Rummy',kind:'cards',min:2,max:2,help:'Draw from the stock or the discard pile, then discard. Make sets of a rank and runs in a suit (ace low); knock when your unmatched cards count 10 or less, or go gin with none for 25. If the other player then has as little, they undercut you for 25. First to 100.',
    init:(n,rnd)=>{ const S={p:0,dl:1,hn:0,sc:[0,0]}; gDeal(S,rnd); return S; },
    moves:gMoves,
    play:(S,m)=>{ const h=S.h[S.p];
      if(m==='N'){ S.dl=1-S.dl; gDeal(S,TG.rng(S)); return S; }
      if(m==='S'){ h.push(S.st.pop()); srt(h); S.nd=-1; S.ph='disc'; return S; }
      if(m==='D'){ const c=S.dp.pop(); h.push(c); srt(h); S.nd=c; S.ph='disc'; return S; }
      const c=Array.isArray(m)?m[1]:m; rm(h,c); S.dp.push(c); S.nd=-1;
      if(!Array.isArray(m)){ if(S.st.length<=2){ S.ko={t:'THE STOCK RAN OUT: NO SCORE.'}; S.hn++; S.ph=S.hn>=15?'over':'show'; S.p=S.dl; } else{ S.p=1-S.p; S.ph='draw'; } return S; }
      const k=S.p, o=1-k, kb=mBest(S.h[k]), ob=mBest(S.h[o]), lay=[]; let od=ob.d;
      if(kb.d>0){ const ms=kb.m.map(x=>x.slice()), dw=S.h[o].filter(c=>!ob.m.some(x=>x.includes(c))); let ch=1; while(ch){ ch=0; for(const c of dw.slice())for(const x of ms)if(fits(x,c)){ x.push(c); rm(dw,c); lay.push(c); ch=1; break; } } od=sum(dw.map(pv)); }
      let w, pts, t; if(!kb.d){ w=k; pts=25+od; t='GIN'; } else if(od<=kb.d){ w=o; pts=25+kb.d-od; t='UNDERCUT'; } else{ w=k; pts=od-kb.d; t='KNOCK'; }
      S.sc[w]+=pts; S.ko={k,m:[...kb.m,...ob.m].flat(),lay,t:t+' ('+kb.d+' AGAINST '+od+'): '+PN(w)+' SCORES '+pts+'.'}; S.hn++; S.ph=S.sc[w]>=100||S.hn>=15?'over':'show'; S.p=S.dl; return S; },
    over:S=>S.ph==='over'?most(S.sc,PN):null,
    ai:S=>{ const h=S.h[S.p]; if(S.ph==='show')return 'N';
      if(S.ph==='draw'){ const top=S.dp[S.dp.length-1]; return !S.st.length||mBest([...h,top]).m.some(x=>x.includes(top))?'D':'S'; }
      let best=null, bd=1e9, bv=-1; for(const c of h){ if(c===S.nd)continue; const d=mBest(h.filter(x=>x!==c)).d; if(d<bd||d===bd&&pv(c)>bv){ bd=d; bv=pv(c); best=c; } } return bd<=10?['K',best]:best; },
    status:S=>S.ph==='draw'?'DRAW FROM THE STOCK OR THE DISCARD PILE.':S.ph==='disc'?'PICK A CARD, THEN DISCARD OR KNOCK.':S.ko?S.ko.t:'',
    draw:(g,S,me,ui)=>{ bg(g); const shown=!!(S.ko&&S.ko.m), sel=me>=0?selOf(ui,S.h[me]):[];
      for(let p=0;p<2;p++)seat(g,2,p,me,S.h[p],p===me||shown,SN(p,me)+' '+S.sc[p],{turn:S.p===p&&S.ph!=='show'&&S.ph!=='over',sel:p===me?sel:null,dim:shown?c=>!S.ko.m.includes(c)&&!S.ko.lay.includes(c):null});
      piles(g,S.st,S.dp,186); panel(g,['HAND '+(S.hn+(S.ph==='show'||S.ph==='over'?0:1)),'GAME TO 100'],48,66);
      if(me>=0)panel(g,['DEADWOOD '+mBest(S.h[me]).d],472,66,1);
      if(S.ph==='disc'&&me===S.p){ const c=sel[0], M=gMoves(S), k=c!=null&&M.some(m=>TG.eq(m,['K',c]));
        TG.btn(g,ui,'disc',W/2-130,388,124,30,'DISCARD',c!=null&&M.includes(c)); TG.btn(g,ui,'knock',W/2+6,388,124,30,k&&!mBest(S.h[me].filter(x=>x!==c)).d?'GIN':'KNOCK',k); }
      if(S.ph==='show'||S.ph==='over'){ say(g,S.ko?S.ko.t:'',290,12); if(S.ph==='show'&&me===S.p)TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT HAND'); } },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y), s=selOf(ui,S.h[me]); if(b==='next')return 'N';
      if(S.ph==='draw')return inR(x,y,PILE[0])?'S':inR(x,y,PILE[1])?'D':null;
      if(S.ph==='disc'){ if(b==='disc'&&s.length)return s[0]; if(b==='knock'&&s.length)return ['K',s[0]]; tog(ui,S.h[me],hitHand(S.h[me],0,true,x,y),1); } return null; }};

  /* ---------- RUMMY: draw, lay down sets and runs or lay off on any meld, discard; go out to score the cards left in the other hands; three hands ---------- */
  const ruDeal=(S,rnd)=>{ const d=TG.deck(rnd), k=S.n===2?10:7; S.h=rng(S.n).map(p=>srt(d.slice(p*k,p*k+k))); S.dp=[d[S.n*k]]; S.st=d.slice(S.n*k+1); S.ml=[]; S.ph='draw'; S.p=(S.dl+1)%S.n; S.nd=-1; S.rs=0; S.res=''; };
  const ruMoves=S=>{ if(S.ph==='draw')return [...(S.st.length?['S']:[]),...(S.dp.length?['D']:[])]; if(S.ph==='end')return ['N']; if(S.ph!=='play')return [];
    const h=S.h[S.p], M=mAll(h).map(m=>['M',...mSort(m)]); h.forEach(c=>S.ml.forEach((m,i)=>{ if(fits(m,c))M.push(['L',c,i]); })); h.forEach(c=>{ if(c!==S.nd||h.length===1)M.push(c); }); return M; };
  const ruEnd=(S,t)=>{ S.res=t; S.hn++; S.ph=S.hn>=3?'over':'end'; S.p=(S.dl+1)%S.n; };
  const ruOut=S=>{ if(S.h[S.p].length)return false; const pts=sum(S.h.flat().map(pv)); S.sc[S.p]+=pts; ruEnd(S,PN(S.p)+' GOES OUT AND SCORES '+pts+'.'); return true; };
  const mRects=ml=>{ const R=[]; let x=56, y=150; for(const m of ml){ const w=(m.length-1)*16+30; if(x+w>464){ x=56; y+=48; } R.push([x,y,w,42]); x+=w+10; } return R; };
  D.rummy={name:'Rummy',kind:'cards',min:2,max:4,help:'Draw from the stock or the discard pile, lay down sets of a rank or runs in a suit (ace low), add cards to any meld on the table, then discard. Go out with no cards left to score the cards in the other hands. Three hands; the most points wins.',
    init:(n,rnd)=>{ const S={p:0,n,dl:n-1,hn:0,sc:Array(n).fill(0)}; ruDeal(S,rnd); return S; },
    moves:ruMoves,
    play:(S,m)=>{ const h=S.h[S.p];
      if(m==='N'){ S.dl=(S.dl+1)%S.n; ruDeal(S,TG.rng(S)); return S; }
      if(m==='S'){ h.push(S.st.pop()); srt(h); S.nd=-1; S.ph='play'; return S; }
      if(m==='D'){ const c=S.dp.pop(); h.push(c); srt(h); S.nd=c; S.ph='play'; return S; }
      if(m[0]==='M'){ const c=m.slice(1); c.forEach(x=>rm(h,x)); S.ml.push(c); ruOut(S); return S; }
      if(m[0]==='L'){ rm(h,m[1]); S.ml[m[2]].push(m[1]); mSort(S.ml[m[2]]); ruOut(S); return S; }
      rm(h,m); S.dp.push(m); S.nd=-1; if(ruOut(S))return S;
      if(!S.st.length){ if(!S.rs&&S.dp.length>1){ S.st=TG.shuffle(S.dp.splice(0,S.dp.length-1),TG.rng(S)); S.rs=1; } else{ ruEnd(S,'THE STOCK RAN OUT: NO SCORE.'); return S; } }
      S.p=(S.p+1)%S.n; S.ph='draw'; return S; },
    over:S=>S.ph==='over'?most(S.sc,PN):null,
    ai:S=>{ const h=S.h[S.p]; if(S.ph==='end')return 'N';
      if(S.ph==='draw'){ const top=S.dp[S.dp.length-1]; if(top!=null&&(mAll([...h,top]).some(m=>m.includes(top))||S.ml.some(m=>fits(m,top))))return 'D'; return S.st.length?'S':'D'; }
      const M=ruMoves(S), ms=M.filter(m=>Array.isArray(m)&&m[0]==='M').sort((a,b)=>b.length-a.length); if(ms.length)return ms[0];
      const ls=M.find(m=>Array.isArray(m)&&m[0]==='L'); if(ls)return ls;
      let best=null, bd=1e9, bv=-1; for(const c of M)if(typeof c==='number'){ const d=mBest(h.filter(x=>x!==c)).d; if(d<bd||d===bd&&pv(c)>bv){ bd=d; bv=pv(c); best=c; } } return best; },
    status:S=>S.ph==='draw'?'DRAW FROM THE STOCK OR THE DISCARD PILE.':S.ph==='play'?'PICK CARDS: MELD, LAY ONE OFF ON A MELD, OR DISCARD.':S.res,
    draw:(g,S,me,ui)=>{ bg(g); const sel=me>=0?selOf(ui,S.h[me]):[];
      for(let p=0;p<S.n;p++)seat(g,S.n,p,me,S.h[p],p===me,SN(p,me)+' '+S.sc[p],{turn:S.p===p&&(S.ph==='draw'||S.ph==='play'),sel:p===me?sel:null});
      piles(g,S.st,S.dp,72); panel(g,['HAND '+Math.min(3,S.hn+(S.ph==='end'||S.ph==='over'?0:1))+' OF 3'],48,66);
      const R=mRects(S.ml); S.ml.forEach((m,i)=>m.forEach((c,j)=>TG.card(g,R[i][0]+j*16,R[i][1],c,true,{w:30,h:42})));
      if(S.ph==='play'&&me===S.p){ const M=ruMoves(S), mv=['M',...mSort(sel.slice())];
        TG.btn(g,ui,'meld',W/2-130,388,124,30,'MELD',sel.length>=3&&M.some(m=>TG.eq(m,mv))); TG.btn(g,ui,'disc',W/2+6,388,124,30,'DISCARD',sel.length===1&&M.includes(sel[0]));
        if(sel.length===1)S.ml.forEach((m,i)=>{ if(fits(m,sel[0])){ g.save(); g.strokeStyle='#f0c040'; g.lineWidth=3; g.strokeRect(R[i][0]-2,R[i][1]-2,R[i][2]+4,R[i][3]+4); g.restore(); } }); }
      if(S.ph==='end'||S.ph==='over'){ say(g,S.res,372,12); if(S.ph==='end'&&me===S.p)TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT HAND'); } },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y), s=selOf(ui,S.h[me]); if(b==='next')return 'N';
      if(S.ph==='draw')return inR(x,y,[PILE[0][0],72,44,62])?'S':inR(x,y,[PILE[1][0],72,44,62])?'D':null;
      if(S.ph!=='play')return null; if(b==='meld')return ['M',...mSort(s.slice())]; if(b==='disc'&&s.length===1)return s[0];
      if(s.length===1){ const i=mRects(S.ml).findIndex(r=>inR(x,y,r)); if(i>=0&&fits(S.ml[i],s[0]))return ['L',s[0],i]; if(inR(x,y,[PILE[1][0],72,44,62]))return s[0]; }
      tog(ui,S.h[me],hitHand(S.h[me],0,true,x,y),11); return null; }};

  /* ---------- CRIBBAGE: deal six, two to the crib, cut the starter; peg to 31 (fifteens, pairs, runs, go), then count the hands and the crib; first to 61 ---------- */
  const cbDeal=(S,rnd)=>{ const d=TG.deck(rnd); S.h=[srt(d.slice(0,6)),srt(d.slice(6,12))]; S.kp=[[],[]]; S.cb=[]; S.cut=d[12]; S.cu=0; S.ph='crib'; S.p=1-S.dl; S.pc=0; S.sq=[]; S.go=[0,0]; S.la=-1; S.sh=null; S.msg=''; };
  const cbAdd=(S,p,n,why)=>{ if(S.ph==='over'||!n)return; S.sc[p]=Math.min(61,S.sc[p]+n); S.msg=PN(p)+': '+why+' '+n+'.'; if(S.sc[p]>=61){ S.ph='over'; S.w=p; } };
  const cbCount=(h,cut,crib)=>{ const a=[...h,cut], v=a.map(pv), r=a.map(lr); let s=0;
    for(let m=1;m<32;m++){ let t=0; for(let i=0;i<5;i++)if(m>>i&1)t+=v[i]; if(t===15)s+=2; }
    for(let i=0;i<5;i++)for(let j=i+1;j<5;j++)if(r[i]===r[j])s+=2;
    const n=Array(14).fill(0); r.forEach(x=>n[x]++); for(let i=0;i<13;){ if(!n[i]){ i++; continue; } let j=i, mul=1; while(n[j]){ mul*=n[j]; j++; } if(j-i>=3)s+=(j-i)*mul; i=j; }
    if(h.every(c=>su(c)===su(h[0])))s+=su(cut)===su(h[0])?5:crib?0:4;
    if(h.some(c=>lr(c)===10&&su(c)===su(cut)))s+=1; return s; };
  const pegPts=(sq,pc)=>{ const c=sq[sq.length-1]; let p=pc===15||pc===31?2:0, k=1; while(k<sq.length&&lr(sq[sq.length-1-k])===lr(c))k++; p+=[0,0,2,6,12][k];
    for(let L=sq.length;L>=3;L--){ const r=sq.slice(-L).map(lr).sort((a,b)=>a-b); if(r.every((x,i)=>!i||x===r[i-1]+1)){ p+=L; break; } } return p; };
  const cbShow=S=>{ S.ph='show'; const nd=1-S.dl, a=cbCount(S.kp[nd],S.cut,0), b=cbCount(S.kp[S.dl],S.cut,0), c=cbCount(S.cb,S.cut,1); S.sh=[a,b,c]; S.p=nd;
    cbAdd(S,nd,a,'HAND'); cbAdd(S,S.dl,b,'HAND'); cbAdd(S,S.dl,c,'CRIB'); };
  const cbCan=(S,q)=>S.h[q].some(c=>S.pc+pv(c)<=31);
  const cbNext=(S,p)=>{ if(S.ph==='over')return; for(const q of [1-p,p])if(S.h[q].length&&(cbCan(S,q)||!S.go[q])){ S.p=q; return; }
    if(S.pc>0&&S.pc<31&&S.la>=0){ cbAdd(S,S.la,1,'LAST CARD'); if(S.ph==='over')return; }
    S.pc=0; S.sq=[]; S.go=[0,0]; if(!S.h[0].length&&!S.h[1].length){ cbShow(S); return; } const q=1-S.la; S.p=S.h[q].length?q:S.la; };
  D.cribbage={name:'Cribbage',kind:'cards',min:2,max:2,help:'Deal six; each lays two in the dealer\'s crib and a starter is cut. Play in turn without passing 31, pegging fifteens, pairs, runs and the last card (say go when you cannot play). Then count your hand with the starter, and the dealer the crib. The short game: first to 61.',
    init:(n,rnd)=>{ const S={p:0,dl:1,sc:[0,0],w:-1}; cbDeal(S,rnd); return S; },
    moves:S=>{ if(S.ph==='crib')return comb(S.h[S.p],2).map(c=>['C',...c]); if(S.ph==='show')return ['N']; if(S.ph!=='peg')return []; const L=S.h[S.p].filter(c=>S.pc+pv(c)<=31); return L.length?L:['G']; },
    play:(S,m)=>{ if(m==='N'){ S.dl=1-S.dl; cbDeal(S,TG.rng(S)); return S; }
      if(Array.isArray(m)){ rm(S.h[S.p],m[1]); rm(S.h[S.p],m[2]); S.cb.push(m[1],m[2]); if(S.cb.length<4){ S.p=1-S.p; return S; }
        srt(S.cb); S.kp=S.h.map(h=>h.slice()); S.cu=1; S.ph='peg'; S.p=1-S.dl; S.msg=''; if(lr(S.cut)===10)cbAdd(S,S.dl,2,'HIS HEELS'); return S; }
      if(m==='G'){ S.go[S.p]=1; S.msg=PN(S.p)+' SAYS GO.'; cbNext(S,S.p); return S; }
      rm(S.h[S.p],m); S.pc+=pv(m); S.sq.push(m); S.la=S.p; cbAdd(S,S.p,pegPts(S.sq,S.pc),S.pc===31?'THIRTY-ONE':'PEGS'); if(S.ph==='over')return S;
      if(S.pc===31){ S.pc=0; S.sq=[]; S.go=[0,0]; } cbNext(S,S.p); return S; },
    over:S=>S.ph==='over'?{win:[S.w],text:PN(S.w)+' WINS, 61 TO '+S.sc[1-S.w]+'.'}:null,
    ai:(S,rnd)=>{ const p=S.p, h=S.h[p]; if(S.ph==='show')return 'N';
      if(S.ph==='crib'){ const seen=new Set(h), cuts=rng(52).filter(c=>!seen.has(c)); let best=null, bv=-1e9;
        for(const [a,b] of comb(h,2)){ const k=h.filter(c=>c!==a&&c!==b); let v=0; for(const c of cuts)v+=cbCount(k,c,0); v/=cuts.length;
          const cv=(lr(a)===lr(b)?2:0)+(pv(a)+pv(b)===15?2:0)+(lr(a)===4?1:0)+(lr(b)===4?1:0)+(Math.abs(lr(a)-lr(b))===1?.5:0); v+=p===S.dl?cv:-cv; if(v>bv){ bv=v; best=['C',a,b]; } } return best; }
      const L=h.filter(c=>S.pc+pv(c)<=31); if(!L.length)return 'G';
      let best=L[0], bv=-1e9; for(const c of L){ const pc=S.pc+pv(c); let v=pegPts([...S.sq,c],pc)*10+pv(c)*.2+rnd()*.1; if(pc===5||pc===21)v-=8; if(pc<15&&pc+10>=15&&pc!==5)v-=1; if(v>bv){ bv=v; best=c; } } return best; },
    status:S=>S.ph==='crib'?'PICK TWO CARDS FOR '+(S.p===S.dl?'YOUR':'THE DEALER\'S')+' CRIB.':S.ph==='peg'?'COUNT '+S.pc+'. PLAY A CARD'+(cbCan(S,S.p)?'.':': SAY GO.'):S.ph==='show'?'THE SHOW: NEXT DEAL.':'',
    draw:(g,S,me,ui)=>{ bg(g); const show=!!S.sh, sel=me>=0&&S.ph==='crib'?selOf(ui,S.h[me]):[], my=me>=0&&S.p===me;
      for(let p=0;p<2;p++){ const cs=show?S.kp[p]:S.h[p]; seat(g,2,p,me,cs,p===me||show,SN(p,me)+(p===S.dl?' DEALER':'')+(show?' HAND '+S.sh[p===S.dl?1:0]:''),{turn:S.p===p&&(S.ph==='crib'||S.ph==='peg'),sel:p===me?sel:null,dim:my&&p===me&&S.ph==='peg'?c=>S.pc+pv(c)>31:null}); }
      // the peg board: 61 holes a player, the front peg at the score
      g.save(); g.fillStyle='#8a5a2c'; g.fillRect(46,74,428,72); g.strokeStyle='#3b2a1e'; g.lineWidth=2; g.strokeRect(46,74,428,72);
      for(let p=0;p<2;p++){ const y=96+p*28, col=p===0?'#c0303a':'#2a5aa0'; for(let i=0;i<=61;i++){ g.fillStyle=i%5===0?'#2a1c12':'#5a3a20'; g.fillRect(56+i*6.6-1,y-1,3,3); }
        g.fillStyle=col; g.beginPath(); g.arc(56+S.sc[p]*6.6+.5,y+.5,5,0,7); g.fill(); TG.text(g,SN(p,me)+' '+S.sc[p],56,y-11,{s:10,a:'left',b:1}); }
      g.restore();
      TG.card(g,440,170,S.cut,!!S.cu,{w:36,h:50}); TG.text(g,'STARTER',458,230,{s:10});
      if(show){ S.cb.forEach((c,i)=>TG.card(g,170+i*46,190,c,true)); TG.text(g,'CRIB '+S.sh[2],260,266,{b:1,s:12}); }
      else{ if(S.cb.length){ TG.card(g,44,170,0,false,{w:36,h:50}); TG.text(g,'CRIB',62,230,{s:10}); }
        S.sq.forEach((c,i)=>TG.card(g,260-(S.sq.length*30+14)/2+i*30,180,c,true)); if(S.ph==='peg')TG.text(g,'COUNT '+S.pc,260,270,{b:1,s:18,serif:1}); }
      if(S.msg)say(g,S.msg,300,12);
      if(my&&S.ph==='crib')TG.btn(g,ui,'crib',W/2-80,388,160,30,'TO THE CRIB ('+sel.length+'/2)',sel.length===2);
      if(my&&S.ph==='peg'&&!cbCan(S,me))TG.btn(g,ui,'go',W/2-60,388,120,30,'GO');
      if(my&&S.ph==='show')TG.btn(g,ui,'next',W/2-70,388,140,30,'NEXT DEAL'); },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y); if(b==='next')return 'N'; if(b==='go')return 'G'; const c=hitHand(S.h[me],0,true,x,y);
      if(S.ph==='crib'){ const s=selOf(ui,S.h[me]); if(b==='crib'&&s.length===2)return ['C',...srt(s.slice())]; tog(ui,S.h[me],c,2); return null; }
      return S.ph==='peg'?c:null; }};

  /* ---------- TEXAS HOLD'EM for play chips: 200 each, blinds 5 and 10; fold, check, call, raise to double or all in; the best five of seven at the showdown; ends with one player holding every chip or after 12 hands ---------- */
  const ev5=cs=>{ const r=cs.map(rk).sort((a,b)=>b-a), fl=cs.every(c=>su(c)===su(cs[0])), n={}; r.forEach(x=>n[x]=(n[x]||0)+1);
    const g=Object.keys(n).map(k=>[n[k],+k]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]), u=[...new Set(r)]; let st=-1; if(u.length===5){ if(u[0]-u[4]===4)st=u[0]; else if(u[0]===12&&u[1]===3)st=3; }
    const k=(c,a)=>a.concat([0,0,0,0,0]).slice(0,5).reduce((s,x)=>s*13+x,c), gr=g.map(x=>x[1]);
    return st>=0&&fl?k(8,[st]):g[0][0]===4?k(7,gr):g[0][0]===3&&g[1][0]===2?k(6,gr):fl?k(5,r):st>=0?k(4,[st]):g[0][0]===3?k(3,gr):g[0][0]===2&&g[1][0]===2?k(2,gr):g[0][0]===2?k(1,gr):k(0,r); };
  const CI={5:comb(rng(5),5),6:comb(rng(6),5),7:comb(rng(7),5)}, best7=cs=>{ let b=-1; for(const ix of CI[cs.length]){ const v=ev5(ix.map(i=>cs[i])); if(v>b)b=v; } return b; };
  const HN=['HIGH CARD','A PAIR','TWO PAIR','THREE OF A KIND','A STRAIGHT','A FLUSH','A FULL HOUSE','FOUR OF A KIND','A STRAIGHT FLUSH'], hcat=v=>Math.floor(v/371293);
  const nx=(S,i)=>{ for(let k=1;k<=S.n;k++){ const j=(i+k)%S.n; if(S.ch[j]>0)return j; } return i; };
  const pkAfter=(S,i)=>{ for(let k=1;k<=S.n;k++){ const j=(i+k)%S.n; if(!S.fd[j]&&S.ch[j]>0&&S.nd[j])return j; } return -1; };
  const put=(S,p,x)=>{ x=Math.min(x,S.ch[p]); S.ch[p]-=x; S.bt[p]+=x; S.cb[p]+=x; };
  const pkEnd=S=>{ S.ph='show'; S.hn++; const alive=S.ch.filter(x=>x>0).length; if(alive<=1||S.hn>=12)S.ph='over'; else S.p=S.ch.findIndex(x=>x>0); };
  const pkShow=S=>{ const live=rng(S.n).filter(j=>!S.fd[j]), val={}; live.forEach(j=>val[j]=best7([...S.h[j],...S.bx])); S.sw=1; S.bd=S.bx.slice();
    const lv=[...new Set(S.cb.filter(x=>x>0))].sort((a,b)=>a-b), won={}; let prev=0, carry=0, last=live;
    for(const L of lv){ let pot=carry; S.cb.forEach(x=>pot+=Math.min(x,L)-Math.min(x,prev)); prev=L; const el=live.filter(j=>S.cb[j]>=L); if(!el.length){ carry=pot; continue; } carry=0;
      const bv=Math.max(...el.map(j=>val[j])), ws=el.filter(j=>val[j]===bv), sh=Math.floor(pot/ws.length); last=ws; ws.forEach((j,i)=>{ const x=sh+(i<pot-sh*ws.length?1:0); S.ch[j]+=x; won[j]=(won[j]||0)+x; }); }
    if(carry){ S.ch[last[0]]+=carry; won[last[0]]=(won[last[0]]||0)+carry; }
    const top=Object.keys(won).map(Number).sort((a,b)=>val[b]-val[a]); S.res=top.map(j=>PN(j)+' WINS '+won[j]).join(', ')+' WITH '+HN[hcat(val[top[0]])]+'.'; pkEnd(S); };
  const pkStreet=S=>{ for(;;){ S.bt=S.bt.map(()=>0); S.cur=0; S.st++; if(S.st>=4){ pkShow(S); return; } S.bd=S.bx.slice(0,S.st+2);
      const can=rng(S.n).filter(j=>!S.fd[j]&&S.ch[j]>0); if(can.length>=2){ S.nd=S.nd.map((_,j)=>can.includes(j)?1:0); S.p=pkAfter(S,S.bn); return; } } };
  const pkDeal=(S,rnd)=>{ const d=TG.deck(rnd); S.bn=nx(S,S.bn); S.h=S.ch.map((c,i)=>c>0?srt([d[i*2],d[i*2+1]]):[]); S.bx=d.slice(8,13); S.bd=[]; S.bt=S.ch.map(()=>0); S.cb=S.bt.slice(); S.fd=S.ch.map(c=>c>0?0:1); S.st=0; S.ph='bet'; S.sw=0; S.res='';
    const sb=S.ch.filter(c=>c>0).length===2?S.bn:nx(S,S.bn), bb=nx(S,sb); put(S,sb,5); put(S,bb,10); S.cur=10; S.nd=S.ch.map((c,i)=>!S.fd[i]&&c>0?1:0); const q=pkAfter(S,bb); if(q<0)pkStreet(S); else S.p=q; };
  const pkMoves=S=>{ if(S.ph==='show')return ['N']; if(S.ph!=='bet')return []; const p=S.p, need=S.cur-S.bt[p], M=need>0?['F','C']:['K'];
    if(rng(S.n).some(j=>j!==p&&!S.fd[j]&&S.ch[j]>0)){ if((S.cur?S.cur*2:10)-S.bt[p]<S.ch[p])M.push('R'); if(S.ch[p]>need)M.push('A'); } return M; };
  const BP={0:[260,372],1:[100,250],2:[260,112],3:[420,250]};
  D.holdem={name:'Texas Hold\'em',kind:'cards',min:2,max:4,help:'Play chips only: everyone starts with 200, blinds 5 and 10. Two cards each and five shared on the table; fold, check, call, raise to double the bet or go all in. The best five-card hand takes the pot. The game ends when one player has every chip, or after 12 hands with the most chips.',
    init:(n,rnd)=>{ const S={p:0,n,ch:Array(n).fill(200),bn:n-1,hn:0}; pkDeal(S,rnd); return S; },
    moves:pkMoves,
    play:(S,m)=>{ if(m==='N'){ pkDeal(S,TG.rng(S)); return S; }
      const p=S.p; if(m==='F')S.fd[p]=1; else if(m==='C')put(S,p,S.cur-S.bt[p]); else if(m==='R'||m==='A'){ put(S,p,m==='A'?S.ch[p]:(S.cur?S.cur*2:10)-S.bt[p]); if(S.bt[p]>S.cur){ S.cur=S.bt[p]; S.nd=S.nd.map((_,j)=>j!==p&&!S.fd[j]&&S.ch[j]>0?1:0); } }
      S.nd[p]=0; S.last=[p,m];
      const live=rng(S.n).filter(j=>!S.fd[j]); if(live.length===1){ const w=live[0], pot=sum(S.cb); S.ch[w]+=pot; S.res=PN(w)+' TAKES '+pot+'.'; pkEnd(S); return S; }
      const q=pkAfter(S,p); if(q>=0)S.p=q; else pkStreet(S); return S; },
    over:S=>S.ph==='over'?most(S.ch,PN):null,
    ai:(S,rnd)=>{ if(S.ph==='show')return 'N'; const p=S.p, M=pkMoves(S), opp=rng(S.n).filter(j=>j!==p&&!S.fd[j]), known=[...S.h[p],...S.bd], pool=rng(52).filter(c=>!known.includes(c)), nb=5-S.bd.length, need=nb+opp.length*2, N=50; let win=0;
      for(let t=0;t<N;t++){ const a=pool; for(let i=0;i<need;i++){ const j=i+Math.floor(rnd()*(a.length-i)); [a[i],a[j]]=[a[j],a[i]]; }
        const bd=[...S.bd,...a.slice(0,nb)], mv=best7([...S.h[p],...bd]); let ok=1, tie=0; for(let o=0;o<opp.length&&ok;o++){ const v=best7([a[nb+o*2],a[nb+o*2+1],...bd]); if(v>mv)ok=0; else if(v===mv)tie=1; } win+=ok?(tie?.5:1):0; }
      const eq=win/N, nd=S.cur-S.bt[p], pot=sum(S.cb), odds=nd/(pot+nd), has=m=>M.includes(m);
      if(eq>.8&&has('A')&&(S.st>=2||rnd()<.25))return 'A';
      if(eq>.62&&has('R')&&S.cur<80&&rnd()<.8)return 'R';
      if(!nd)return eq>.5&&has('R')&&rnd()<.5?'R':'K';
      return eq>=odds+.06||nd<=5&&eq>.25?'C':'F'; },
    status:S=>S.ph==='bet'?['BEFORE THE FLOP','THE FLOP','THE TURN','THE RIVER'][S.st]+': POT '+sum(S.cb)+'.':S.res,
    draw:(g,S,me,ui)=>{ bg(g);
      for(let p=0;p<S.n;p++){ const up=p===me||S.sw&&!S.fd[p], out=!S.h[p].length; seat(g,S.n,p,me,S.h[p],up,SN(p,me)+(out?' OUT':' '+S.ch[p])+(p===S.bn?' (D)':'')+(S.fd[p]&&!out?' FOLD':!out&&!S.ch[p]&&S.ph==='bet'?' ALL IN':''),{turn:S.ph==='bet'&&S.p===p,dim:S.fd[p]?()=>1:null});
        const [bx,by]=BP[posOf(S.n,p,me)]; if(S.bt[p]&&S.ph==='bet')TG.text(g,'BET '+S.bt[p],bx,by,{b:1,s:12,c:'#f0d070'}); }
      for(let i=0;i<5;i++){ if(i<S.bd.length)TG.card(g,142+i*48,180,S.bd[i],true); else{ g.save(); g.strokeStyle='rgba(241,230,200,.25)'; g.strokeRect(142+i*48,180,44,62); g.restore(); } }
      TG.text(g,'POT '+sum(S.cb),260,262,{b:1,s:16,serif:1}); panel(g,['HAND '+Math.min(12,S.hn+(S.ph==='bet'?1:0))+' OF 12','BLINDS 5/10'],48,66);
      if(S.ph!=='bet')say(g,S.res,300,12);
      if(S.ph==='bet'&&me===S.p){ const M=pkMoves(S), nd=S.cur-S.bt[me], to=S.cur?S.cur*2:10; let x=W/2-((M.length*118-8)/2);
        for(const m of M){ TG.btn(g,ui,m,x,388,110,30,m==='F'?'FOLD':m==='K'?'CHECK':m==='C'?'CALL '+Math.min(nd,S.ch[me]):m==='R'?(S.cur?'RAISE TO '+to:'BET 10'):'ALL IN '+(S.ch[me]+S.bt[me])); x+=118; } }
      if(S.ph==='show'&&me===S.p)TG.btn(g,ui,'N',W/2-70,388,140,30,'NEXT HAND'); },
    click:(S,me,x,y,ui)=>{ if(me<0)return null; const b=TG.hit(ui,x,y); return b&&'FKCRAN'.includes(b)?b:null; }};
  return D; });
