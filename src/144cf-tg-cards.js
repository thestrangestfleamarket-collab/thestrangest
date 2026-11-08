// THE CAFÉ'S CARD GAMES (TG, 144cc): three solitaires (Klondike, FreeCell, Spider) and five table games (War, Crazy Eights, Go Fish, Old Maid, Blackjack), each its rules, the computer's play and its table drawn.
import {TG} from './144cc-tables.js';
TG.lib.push(()=>{ '@tables'; const D={};
  /* ---------- shared: values (ace 0 to king 12), colours, slots, messages, the most-wins result ---------- */
  const V=c=>(c%13+1)%13, SU=c=>Math.floor(c/13)%4, RED=c=>SU(c)===1||SU(c)===2, RN=r=>r===8?'10':TG.RANKS[r], PN=i=>'P'+(i+1), GOLD='#f0c040', CREAM='#f1e6c8';
  const ok=(G,S,m)=>m!=null&&G.moves(S).some(q=>TG.eq(q,m))?m:null;
  const slot=(g,x,y,w,h,t='')=>{ g.save(); g.strokeStyle='rgba(241,230,200,.45)'; g.lineWidth=2; g.strokeRect(x+1,y+1,w-2,h-2); g.restore(); if(t)TG.text(g,t,x+w/2,y+h/2,{s:18,c:'rgba(241,230,200,.6)',serif:1}); };
  const ring=(g,x,y,w,h)=>{ g.save(); g.strokeStyle=GOLD; g.lineWidth=3; g.strokeRect(x-3,y-3,w+6,h+6); g.restore(); };
  const wrap=(g,t,y)=>{ const L=[]; let line=''; for(const w of t.split(' ')){ if((line+' '+w).length>62){ L.push(line); line=w; } else line=line?line+' '+w:w; } L.push(line); L.forEach((l,i)=>TG.text(g,l,260,y+i*15,{s:11,c:'#e8d6a8'})); };
  const top=(sc,what)=>{ const hi=Math.max(...sc), w=sc.map((v,i)=>v===hi?i:-1).filter(i=>i>=0), all=sc.length>1&&w.length===sc.length;
    return {win:all?[]:w,text:(all?'ALL TIED':w.map(PN).join(' AND ')+(w.length>1?' TIE':' WINS'))+' WITH '+hi+' '+what+'.'}; };

  /* ---------- solitaire helpers: columns squeezed to fit, click a card then where it goes ---------- */
  const colY=(n,u,y0,room,ch)=>{ let b=22; const up=n-u; if(up>1&&u*7+(up-1)*b+ch>room)b=Math.max(5,(room-ch-u*7)/(up-1)); const Y=[]; for(let k=0,y=y0;k<n;k++){ Y.push(y); y+=k<u?7:b; } return Y; };
  const colHit=(col,u,i,y,y0,room,ch)=>{ const Y=colY(col.length,u,y0,room,ch); let k=-1; for(let a=col.length-1;a>=0;a--)if(y>=Y[a]){ k=a; break; } return {dst:i,src:k>=0&&k>=u?[i,k]:null}; };
  // the same card clicked twice goes up to the foundation (up), a card then a place moves it there, a failed move picks the new card
  const soli=(G,S,ui,src,dst,up)=>{ if(ui.sel){ const [i,k]=ui.sel; ui.sel=null; if(src&&src[0]===i&&src[1]===k)return up==null?null:ok(G,S,[i,k,up]); if(dst!=null){ const m=ok(G,S,[i,k,dst]); if(m)return m; } } if(src)ui.sel=src; return null; };
  const targets=(G,S,sel)=>sel?G.moves(S).filter(m=>Array.isArray(m)&&m[0]===sel[0]&&m[1]===sel[1]).map(m=>m[2]):[];
  const soloOver=(S,won)=>won?{win:[0],text:'SOLVED! YOU WIN.'}:S.g||S.n>=600?{win:[],text:S.g?'GAVE UP.':'OUT OF MOVES (600).'}:null;
  const flip=(S,i)=>{ if(S.u[i]>=S.t[i].length)S.u[i]=Math.max(0,S.t[i].length-1); };
  const giveBtn=(g,S,ui,W,H)=>{ if(!S.g&&S.n<600)TG.btn(g,ui,'give',W-110,H-32,100,26,'GIVE UP'); TG.text(g,'MOVE '+S.n+' OF 600',80,H-19,{s:12}); };
  const drawCols=(g,S,ui,X,y0,room,w,h,dst,face=c=>c)=>S.t.forEach((col,i)=>{ const u=S.u?S.u[i]:0, Y=colY(col.length,u,y0,room,h), x=X(i), sel=ui.sel; if(!col.length)slot(g,x,y0,w,h);
    col.forEach((c,k)=>TG.card(g,x,Y[k],face(c),k>=u,{w,h,sel:sel&&sel[0]===i&&k>=sel[1]})); if(dst.includes(i))ring(g,x,col.length?Y[col.length-1]:y0,w,h); });

  /* ---------- KLONDIKE: build down in alternating colours, each suit ace to king on the foundations; draw one, any number of passes ---------- */
  const KW=56, KH=78, KT=100, KR=384, kx=i=>8+i*73, kUp=(S,c)=>V(c)===S.f[SU(c)];
  const kOn=(S,c,j)=>{ const col=S.t[j]; if(!col.length)return V(c)===12; const t=col[col.length-1]; return V(t)===V(c)+1&&RED(t)!==RED(c); };
  D.klondike={name:'Klondike',kind:'cards',min:1,max:1,help:'Build the columns down in alternating colours and each suit from ace to king on the foundations; only a king fills an empty column. Click a card, then where it goes (click it again to send it up); click the stock to draw.',
    init:(n,rnd)=>{ const d=TG.deck(rnd), t=[]; for(let i=0;i<7;i++)t.push(d.splice(0,i+1)); return {p:0,t,u:[0,1,2,3,4,5,6],s:d,w:[],f:[0,0,0,0],n:0,z:0,g:0}; },
    moves:S=>{ if(D.klondike.over(S))return []; const M=[]; if(S.s.length||S.w.length)M.push('D');
      if(S.w.length){ const c=S.w[S.w.length-1]; if(kUp(S,c))M.push([7,0,9]); for(let j=0;j<7;j++)if(kOn(S,c,j))M.push([7,0,j]); }
      S.t.forEach((col,i)=>{ if(!col.length)return; if(kUp(S,col[col.length-1]))M.push([i,col.length-1,9]); for(let k=S.u[i];k<col.length;k++)for(let j=0;j<7;j++)if(j!==i&&kOn(S,col[k],j))M.push([i,k,j]); });
      M.push('G'); return M; },
    play:(S,m)=>{ S.n++; if(m==='G'){ S.g=1; return S; } if(m==='D'){ if(S.s.length)S.w.push(S.s.pop()); else { S.s=S.w.reverse(); S.w=[]; S.z++; } return S; }
      S.z=0; const [i,k,j]=m, run=i===7?[S.w.pop()]:S.t[i].splice(k); if(i<7)flip(S,i); if(j===9)S.f[SU(run[0])]++; else S.t[j].push(...run); return S; },
    over:S=>soloOver(S,S.f.every(x=>x===13)),
    // up first, then a move that turns a card over, then the waste; draw until a whole pass finds nothing, then give up
    ai:S=>{ let best=null, bv=0; for(const m of D.klondike.moves(S)){ if(!Array.isArray(m))continue; const [i,k,j]=m; let v;
        if(j===9)v=100; else if(i===7)v=40; else if(k===S.u[i])v=k>0?60+k:0; else v=kUp(S,S.t[i][k-1])?50:0; if(v>bv){ bv=v; best=m; } }
      return best||(S.s.length||!S.z&&S.w.length?'D':'G'); },
    status:S=>'UP '+S.f.reduce((a,b)=>a+b,0)+' OF 52 · STOCK '+S.s.length+'.',
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const sel=ui.sel, dst=targets(D.klondike,S,sel);
      if(S.s.length)TG.card(g,kx(0),8,0,false,{w:KW,h:KH}); else slot(g,kx(0),8,KW,KH,S.w.length?'↺':''); TG.text(g,''+S.s.length,kx(0)+KW/2,8+KH+9,{s:11});
      if(S.w.length)TG.card(g,kx(1),8,S.w[S.w.length-1],true,{w:KW,h:KH,sel:sel&&sel[0]===7}); else slot(g,kx(1),8,KW,KH);
      const sc=sel?(sel[0]===7?S.w[S.w.length-1]:(S.t[sel[0]]||[])[sel[1]]):null;
      for(let s=0;s<4;s++){ const x=kx(3+s); if(S.f[s])TG.card(g,x,8,s*13+(S.f[s]+11)%13,true,{w:KW,h:KH}); else slot(g,x,8,KW,KH,TG.SUITS[s]); if(dst.includes(9)&&sc!=null&&SU(sc)===s)ring(g,x,8,KW,KH); }
      drawCols(g,S,ui,kx,KT,KR,KW,KH,dst); giveBtn(g,S,ui,W,H); },
    click:(S,me,x,y,ui)=>{ if(TG.hit(ui,x,y)==='give'){ ui.sel=null; return 'G'; } const i=Math.floor((x-8)/73); if(i<0||i>6||x-kx(i)>KW){ ui.sel=null; return null; }
      if(y<KT){ if(y<8||y>=8+KH||i===2){ ui.sel=null; return null; } if(i===0){ ui.sel=null; return ok(D.klondike,S,'D'); } return soli(D.klondike,S,ui,i===1&&S.w.length?[7,0]:null,i>=3?9:null,9); }
      const h=colHit(S.t[i],S.u[i],i,y,KT,KR,KH); return soli(D.klondike,S,ui,h.src,h.dst,9); }};

  /* ---------- FREECELL: every card face up; four free cells; build down in alternating colours, suits up on the foundations ---------- */
  const FX=i=>8+i*64, fcOn=(S,c,j)=>{ const col=S.t[j]; if(!col.length)return true; const t=col[col.length-1]; return V(t)===V(c)+1&&RED(t)!==RED(c); };
  // how good a deal stands: cards up, cells and columns free, few cards on top of lower ones, the next cards up near the top
  const fcScore=S=>{ let v=S.f.reduce((a,b)=>a+b,0)*40+S.c.filter(c=>c<0).length*10+S.t.filter(c=>!c.length).length*20;
    for(const col of S.t){ let mn=99; for(const c of col){ if(V(c)>mn)v-=8; mn=Math.min(mn,V(c)); } }
    for(let s=0;s<4;s++)if(S.f[s]<13){ const need=s*13+(S.f[s]+12)%13; for(const col of S.t){ const a=col.indexOf(need); if(a>=0)v-=(col.length-1-a)*8; } }
    return v; };
  D.freecell={name:'FreeCell',kind:'cards',min:1,max:1,help:'All cards are dealt face up. Build the columns down in alternating colours and each suit from ace to king on the foundations; any card may rest in a free cell, and a run moves as far as the free cells allow. Click a card, then where it goes (again to send it up).',
    init:(n,rnd)=>{ const d=TG.deck(rnd), t=[[],[],[],[],[],[],[],[]]; d.forEach((c,i)=>t[i%8].push(c)); return {p:0,t,c:[-1,-1,-1,-1],f:[0,0,0,0],n:0,z:0,g:0,l:[-1,-1]}; },
    moves:S=>{ if(D.freecell.over(S))return []; const M=[], fc=S.c.filter(c=>c<0).length, ec=S.t.filter(c=>!c.length).length;
      S.c.forEach((c,i)=>{ if(c<0)return; if(V(c)===S.f[SU(c)])M.push([8+i,0,9]); for(let j=0;j<8;j++)if(fcOn(S,c,j))M.push([8+i,0,j]); });
      S.t.forEach((col,i)=>{ const L=col.length; if(!L)return; const t=col[L-1]; if(V(t)===S.f[SU(t)])M.push([i,L-1,9]); if(fc)M.push([i,L-1,8]);
        for(let k=L-1;k>=0;k--){ if(k<L-1){ const a=col[k], b=col[k+1]; if(V(a)!==V(b)+1||RED(a)===RED(b))break; }
          for(let j=0;j<8;j++)if(j!==i&&fcOn(S,col[k],j)&&L-k<=(fc+1)*2**(ec-(S.t[j].length?0:1)))M.push([i,k,j]); } });
      M.push('G'); return M; },
    play:(S,m)=>{ S.n++; S.z++; if(m==='G'){ S.g=1; return S; } const [i,k,j]=m; let run; if(i>=8){ run=[S.c[i-8]]; S.c[i-8]=-1; } else run=S.t[i].splice(k);
      if(j===9){ S.f[SU(run[0])]++; S.z=0; } else if(j===8)S.c[S.c.indexOf(-1)]=run[0]; else S.t[j].push(...run); S.l=[run[0],i>=8?8:i]; return S; },
    over:S=>soloOver(S,S.f.every(x=>x===13)),
    // up whenever it can, else the best-looking move that does not undo the last; gives up after 80 moves with nothing going up
    ai:S=>{ const up=D.freecell.moves(S).find(m=>m[2]===9); if(up)return up; if(S.z>80)return 'G';
      const opts=S=>D.freecell.moves(S).filter(m=>{ if(!Array.isArray(m))return false; const head=m[0]>=8?S.c[m[0]-8]:S.t[m[0]][m[1]]; return !(head===S.l[0]&&m[2]===S.l[1]||m[0]<8&&m[1]===0&&m[2]<8&&!S.t[m[2]].length); });
      // two moves ahead: a move is worth the best place it or a follow-up reaches
      let best=null, bv=-1e9; for(const m of opts(S)){ const S1=D.freecell.play(TG.clone(S),m); let v=fcScore(S1); for(const m2 of opts(S1).slice(0,60))v=Math.max(v,fcScore(D.freecell.play(TG.clone(S1),m2))-1);
        if(v>bv){ bv=v; best=m; } } return best||'G'; },
    status:S=>'UP '+S.f.reduce((a,b)=>a+b,0)+' OF 52 · '+S.c.filter(c=>c<0).length+' CELLS FREE.',
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const sel=ui.sel, dst=targets(D.freecell,S,sel), sc=sel?(sel[0]>=8?S.c[sel[0]-8]:(S.t[sel[0]]||[])[sel[1]]):null;
      for(let i=0;i<4;i++){ const c=S.c[i]; if(c>=0)TG.card(g,FX(i),8,c,true,{w:KW,h:KH,sel:sel&&sel[0]===8+i}); else slot(g,FX(i),8,KW,KH,'·'); if(dst.includes(8)&&c<0)ring(g,FX(i),8,KW,KH); }
      for(let s=0;s<4;s++){ const x=FX(4+s); if(S.f[s])TG.card(g,x,8,s*13+(S.f[s]+11)%13,true,{w:KW,h:KH}); else slot(g,x,8,KW,KH,TG.SUITS[s]); if(dst.includes(9)&&sc!=null&&SU(sc)===s)ring(g,x,8,KW,KH); }
      drawCols(g,S,ui,FX,KT,KR,KW,KH,dst); giveBtn(g,S,ui,W,H); },
    click:(S,me,x,y,ui)=>{ if(TG.hit(ui,x,y)==='give'){ ui.sel=null; return 'G'; } const i=Math.floor((x-8)/64); if(i<0||i>7||x-FX(i)>KW){ ui.sel=null; return null; }
      if(y<KT){ if(y<8||y>=8+KH){ ui.sel=null; return null; } return i<4?soli(D.freecell,S,ui,S.c[i]>=0?[8+i,0]:null,8,9):soli(D.freecell,S,ui,null,9,9); }
      const h=colHit(S.t[i],0,i,y,KT,KR,KH); return soli(D.freecell,S,ui,h.src,h.dst,9); }};

  /* ---------- SPIDER (one suit): two decks of spades in ten columns; build down by one, a run king to ace leaves the table; deal a row from the stock ---------- */
  const SX=i=>6+i*51, SW=46, SH=64, ST=86, SR=398, sp=c=>39+c%13;
  const spDone=(S,i)=>{ const col=S.t[i], L=col.length; if(L<13||L-13<S.u[i])return; for(let a=0;a<13;a++)if(V(col[L-13+a])!==12-a)return; col.splice(L-13); S.d++; flip(S,i); };
  D.spider={name:'Spider',kind:'cards',min:1,max:1,help:'One suit, two decks. Build down by one on any column; cards in order move together, and a full run from king to ace leaves the table. Click the stock to deal a card on every column. Clear all eight runs to win.',
    init:(n,rnd)=>{ const d=TG.shuffle([...Array(104).keys()],rnd), t=[]; for(let i=0;i<10;i++)t.push(d.splice(0,i<4?6:5)); return {p:0,t,u:t.map(c=>c.length-1),s:d,d:0,n:0,g:0}; },
    moves:S=>{ if(D.spider.over(S))return []; const M=[]; if(S.s.length)M.push('D');
      S.t.forEach((col,i)=>{ const L=col.length; for(let k=L-1;k>=S.u[i]&&k>=0;k--){ if(k<L-1&&V(col[k])!==V(col[k+1])+1)break;
        for(let j=0;j<10;j++){ if(j===i)continue; const tj=S.t[j]; if(!tj.length||V(tj[tj.length-1])===V(col[k])+1)M.push([i,k,j]); } } });
      M.push('G'); return M; },
    play:(S,m)=>{ S.n++; if(m==='G'){ S.g=1; return S; } if(m==='D'){ for(let i=0;i<10&&S.s.length;i++)S.t[i].push(S.s.pop()); for(let i=0;i<10;i++)spDone(S,i); return S; }
      const [i,k,j]=m; S.t[j].push(...S.t[i].splice(k)); flip(S,i); spDone(S,j); return S; },
    over:S=>soloOver(S,S.d===8),
    // turn a card over, empty a column, or join a run to its place; never split a run that is already in order; then deal
    ai:S=>{ let best=null, bv=0; for(const m of D.spider.moves(S)){ if(!Array.isArray(m))continue; const [i,k,j]=m, col=S.t[i], tj=S.t[j]; let v;
        if(k>0&&k===S.u[i])v=(tj.length?50:20)+k; else if(k===0)v=tj.length?30:-1; else if(!tj.length||V(col[k-1])===V(col[k])+1)v=-1; else v=1+col.length-k;
        if(v>bv){ bv=v; best=m; } } return best||(S.s.length?'D':'G'); },
    status:S=>'RUNS '+S.d+' OF 8 · '+S.s.length/10+' DEALS LEFT.',
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const dst=targets(D.spider,S,ui.sel);
      for(let a=0;a<S.d;a++)TG.card(g,SX(0)+a*16,10,50,true,{w:SW,h:SH}); if(!S.d)TG.text(g,'RUNS 0 OF 8',SX(1),42,{s:12});
      for(let a=0;a<S.s.length/10;a++)TG.card(g,SX(9)-a*8,10,0,false,{w:SW,h:SH}); if(!S.s.length)slot(g,SX(9),10,SW,SH);
      drawCols(g,S,ui,SX,ST,SR,SW,SH,dst,sp); giveBtn(g,S,ui,W,H); },
    click:(S,me,x,y,ui)=>{ if(TG.hit(ui,x,y)==='give'){ ui.sel=null; return 'G'; } if(y<ST){ ui.sel=null; return x>=SX(9)-40&&y>=10&&y<10+SH?ok(D.spider,S,'D'):null; }
      const i=Math.floor((x-6)/51); if(i<0||i>9||x-SX(i)>SW){ ui.sel=null; return null; } const h=colHit(S.t[i],S.u[i],i,y,ST,SR,SH); return soli(D.spider,S,ui,h.src,h.dst,null); }};

  /* ---------- the hands around a table: yours face up at the bottom, the others face down with a label ---------- */
  const SPOT={2:['top'],3:['left','right'],4:['left','top','right']}, HY=446;
  const around=(n,me)=>{ const b=me<0?0:me; return (SPOT[n]||[]).map((s,i)=>[(b+i+1)%n,s]); };
  const backs=(g,k,spot,label,hot)=>{ const m=Math.min(k,10), c=hot?GOLD:CREAM;
    if(spot==='top'){ const x0=260-(m*12+20)/2; for(let i=0;i<m;i++)TG.card(g,x0+i*12,34,0,false,{w:32,h:46}); TG.text(g,label,260,18,{b:1,c,s:12}); }
    else{ const x=spot==='left'?10:478; for(let i=0;i<m;i++)TG.card(g,x,130+i*10,0,false,{w:32,h:46}); TG.text(g,label,spot==='left'?8:512,114,{b:1,c,s:11,a:spot}); } };
  const fan=k=>{ const s=k>1?Math.min(50,(500-44)/(k-1)):0, x0=(520-(s*(k-1)+44))/2; return i=>x0+i*s; };
  const fanHit=(k,x,y)=>{ if(y<HY-8||y>HY+62)return -1; const X=fan(k); for(let i=k-1;i>=0;i--)if(x>=X(i)&&x<X(i)+44)return i; return -1; };
  const myHand=(g,h,me,o=()=>({}))=>{ const X=fan(h.length); h.forEach((c,i)=>TG.card(g,X(i),HY,c,me>=0,me>=0?o(c,i):{})); };
  const myLabel=(g,S,me,t)=>{ const b=me<0?0:me; TG.text(g,(me<0?PN(0):'YOU')+t,260,HY-22,{b:1,c:S.p===b?GOLD:CREAM}); };

  /* ---------- WAR: both flip their top card, the higher rank takes both; a tie is a war, three down and flip again ---------- */
  D.war={name:'War',kind:'cards',min:2,max:2,help:'Each round both players flip their top card and the higher rank takes the cards; a tie is a war: three cards down, then flip again. Win every card, or have the most after 300 rounds.',
    init:(n,rnd)=>{ const d=TG.deck(rnd); return {p:0,h:[d.slice(0,26),d.slice(26)],a:-1,b:-1,pot:[],n:0,m:''}; },
    moves:S=>D.war.over(S)?[]:['F'],
    play:(S,m)=>{ if(S.p===0){ S.a=S.h[0].shift(); S.b=-1; S.pot.push(S.a); S.p=1; S.m=S.pot.length>1?'WAR!':''; return S; }
      S.n++; S.b=S.h[1].shift(); S.pot.push(S.b); S.p=0; const ra=S.a%13, rb=S.b%13;
      if(ra!==rb){ const w=ra>rb?0:1; S.m=PN(w)+' TAKES '+S.pot.length+'.'; S.h[w].push(...TG.shuffle(S.pot,TG.rng(S))); S.pot=[]; }
      else{ S.m='WAR!'; for(const q of [0,1])for(let i=0;i<3&&S.h[q].length>1;i++)S.pot.push(S.h[q].shift()); } return S; },
    over:S=>{ const x=S.h[0].length, y=S.h[1].length; if(S.p===0&&!x||S.p===1&&!y){ const w=S.p===0?1:0; return {win:[w],text:PN(w)+' WINS EVERY CARD.'}; }
      if(S.n>=300&&S.p===0)return x===y?{win:[],text:'A DRAW AFTER 300 ROUNDS.'}:{win:[x>y?0:1],text:PN(x>y?0:1)+' WINS, '+Math.max(x,y)+' CARDS TO '+Math.min(x,y)+'.'}; return null; },
    ai:()=>'F',
    status:S=>'CARDS '+S.h[0].length+' TO '+S.h[1].length+' · ROUND '+(S.n+1)+' OF 300.',
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const b=me===1?1:0, o=1-b;
      const pile=(q,y,ly)=>{ const k=S.h[q].length; if(k)for(let i=0;i<Math.min(5,Math.ceil(k/6));i++)TG.card(g,230+i*2,y-i*2,0,false,{w:60,h:84}); else slot(g,230,y,60,84);
        TG.text(g,(q===me?'YOU':PN(q))+' · '+k+' CARDS',260,ly,{b:1,c:S.p===q?GOLD:CREAM}); };
      pile(o,26,124); pile(b,384,368);
      [o,b].forEach((q,j)=>{ const x=j?290:170, c=q?S.b:S.a; if(c>=0)TG.card(g,x,180,c,true,{w:60,h:84}); else slot(g,x,180,60,84); TG.text(g,PN(q),x+30,278,{s:11}); });
      TG.text(g,S.m+(S.pot.length?' · '+S.pot.length+' ON THE TABLE':''),260,308,{b:1,c:'#e8d6a8'});
      if(me>=0&&S.p===me&&!D.war.over(S))TG.btn(g,ui,'F',330,410,110,34,'FLIP'); },
    click:(S,me,x,y,ui)=>S.p===me&&(TG.hit(ui,x,y)==='F'||x>=226&&x<300&&y>=370&&y<470)?ok(D.war,S,'F'):null};

  /* ---------- CRAZY EIGHTS: match the top card's suit or rank, eights are wild; first out scores the others' hands ---------- */
  const SNAME=['CLUBS','DIAMONDS','HEARTS','SPADES'];
  const C8P=c=>{ const r=c%13; return r===6?50:r>=8&&r<=11?10:r===12?1:r+2; }, c8Pts=h=>h.reduce((a,c)=>a+C8P(c),0);
  const c8Deal=(S,rnd)=>{ const d=TG.deck(rnd), k=S.h.length===2?7:5; S.h=S.h.map(()=>d.splice(0,k)); S.d=[d.pop()]; S.s=d; S.su=SU(S.d[0]); S.ph='play'; S.dr=0; S.ps=0; S.p=(S.hn-1)%S.h.length; };
  const c8Can=(S,c)=>c%13===6||SU(c)===S.su||c%13===S.d[S.d.length-1]%13;
  const c8Next=S=>{ S.p=(S.p+1)%S.h.length; S.dr=0; };
  const c8End=(S,w)=>{ const pts=S.h.reduce((a,h,i)=>a+(i===w?0:c8Pts(h)),0); S.sc[w]+=pts; S.m=PN(w)+' WINS HAND '+S.hn+', +'+pts+'.'; S.ph='end'; S.p=w; if(S.hn>=3||S.sc[w]>=100)S.fin=1; };
  const c8Suit=h=>{ const n=[0,0,0,0]; h.forEach(c=>{ if(c%13!==6)n[SU(c)]++; }); return n.indexOf(Math.max(...n)); };
  D.crazyeights={name:'Crazy Eights',kind:'cards',min:2,max:4,help:'Play a card of the same suit or rank as the top card; an eight goes on anything and names the suit. Stuck? Draw one, then play or pass. First out scores the cards left in the other hands; three hands or 100 points.',
    init:(n,rnd)=>{ const S={p:0,h:Array(n).fill(0),sc:Array(n).fill(0),hn:1,m:''}; c8Deal(S,rnd); return S; },
    moves:S=>{ if(S.fin)return []; if(S.ph==='end')return ['N']; if(S.ph==='suit')return ['S0','S1','S2','S3'];
      const M=S.h[S.p].filter(c=>c8Can(S,c)), more=S.s.length||S.d.length>1; if(!S.dr&&more)M.push('D'); if(S.dr||!more)M.push('P'); return M; },
    play:(S,m)=>{ const rnd=TG.rng(S);
      if(m==='N'){ S.hn++; c8Deal(S,rnd); S.m=''; return S; }
      if(typeof m==='string'&&m[0]==='S'){ S.su=+m[1]; S.ph='play'; S.m=PN(S.p)+' CALLS '+SNAME[S.su]+'.'; c8Next(S); return S; }
      if(m==='D'){ if(!S.s.length){ const t=S.d.pop(); S.s=TG.shuffle(S.d,rnd); S.d=[t]; } S.h[S.p].push(S.s.pop()); S.dr=1; S.m=PN(S.p)+' DRAWS.'; return S; }
      if(m==='P'){ S.ps=!S.s.length&&S.d.length<=1?S.ps+1:0; S.m=PN(S.p)+' PASSES.';
        if(S.ps>=S.h.length){ const v=S.h.map(c8Pts); c8End(S,v.indexOf(Math.min(...v))); return S; } c8Next(S); return S; }
      const h=S.h[S.p]; h.splice(h.indexOf(m),1); S.d.push(m); S.su=SU(m); S.ps=0; S.m='';
      if(!h.length){ c8End(S,S.p); return S; } if(m%13===6){ S.ph='suit'; return S; } c8Next(S); return S; },
    over:S=>S.fin?top(S.sc,'POINTS'):null,
    // keep eights for last, play into the suit you hold most of, shed high cards; draw when stuck
    ai:S=>{ if(S.ph==='suit')return 'S'+c8Suit(S.h[S.p]); if(S.ph==='end')return 'N'; const M=D.crazyeights.moves(S), h=S.h[S.p], n=[0,0,0,0]; h.forEach(c=>n[SU(c)]++);
      let best=null, bv=-1e9; for(const m of M){ if(typeof m!=='number')continue; const v=(m%13===6?-100:0)+n[SU(m)]*10+C8P(m); if(v>bv){ bv=v; best=m; } }
      return best!=null?best:M.includes('D')?'D':'P'; },
    status:S=>'HAND '+S.hn+' OF 3 · '+(S.ph==='suit'?'NAME A SUIT.':S.ph==='end'?'NEXT HAND.':S.dr?'PLAY OR PASS.':'MATCH '+TG.SUITS[S.su]+' OR '+RN(S.d[S.d.length-1]%13)+'.'),
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const n=S.h.length, mine=me>=0&&S.p===me&&!S.fin, b=me<0?0:me;
      for(const [i,s] of around(n,me))backs(g,S.h[i].length,s,PN(i)+' · '+S.h[i].length+' · '+S.sc[i]+' PTS',S.p===i);
      if(S.s.length)TG.card(g,180,160,0,false,{w:56,h:78}); else slot(g,180,160,56,78); TG.text(g,S.s.length+' LEFT',208,252,{s:11});
      TG.card(g,284,160,S.d[S.d.length-1],true,{w:56,h:78}); TG.text(g,'SUIT '+TG.SUITS[S.su],312,252,{s:14,b:1,c:RED(S.su*13)?'#ff8080':CREAM});
      if(S.m)wrap(g,S.m,280);
      myLabel(g,S,me,' · '+S.sc[b]+' PTS'); myHand(g,S.h[b],me,c=>({dim:mine&&S.ph==='play'&&!c8Can(S,c)}));
      if(mine){ const M=D.crazyeights.moves(S); if(S.ph==='play'){ TG.btn(g,ui,'D',150,316,100,30,'DRAW',M.includes('D')); TG.btn(g,ui,'P',270,316,100,30,'PASS',M.includes('P')); }
        else if(S.ph==='suit')SNAME.forEach((t,i)=>TG.btn(g,ui,'S'+i,30+i*118,316,110,30,TG.SUITS[i]+' '+t));
        else TG.btn(g,ui,'N',190,316,140,32,'NEXT HAND'); } },
    click:(S,me,x,y,ui)=>{ const b=TG.hit(ui,x,y); if(b)return ok(D.crazyeights,S,b); if(me<0||S.p!==me||!S.h[me])return null; const i=fanHit(S.h[me].length,x,y); return i<0?null:ok(D.crazyeights,S,S.h[me][i]); }};

  /* ---------- GO FISH: ask a player for a rank you hold; no luck, go fish; four of a rank make a book ---------- */
  const gfBooks=(S,p)=>{ for(let r=0;r<13;r++)if(S.h[p].filter(c=>c%13===r).length===4){ S.h[p]=S.h[p].filter(c=>c%13!==r); S.b[p]++; S.k[p]&=~(1<<r); S.m+=' A BOOK OF '+RN(r)+'S.'; } };
  // a player with no cards draws one from the pond, or is skipped when it is empty
  const gfFix=S=>{ for(let t=0;t<S.h.length;t++){ if(S.h[S.p].length)return; if(S.s.length){ S.h[S.p].push(S.s.pop()); return; } S.p=(S.p+1)%S.h.length; } };
  const gfNext=S=>{ S.p=(S.p+1)%S.h.length; gfFix(S); };
  D.gofish={name:'Go Fish',kind:'cards',min:2,max:4,help:'Pick a card and ask a player for that rank: they hand over all they have and you go again; if they have none, go fish from the pond (fish the rank you asked for and you go again). Four of a rank make a book; most books wins.',
    init:(n,rnd)=>{ const d=TG.deck(rnd), S={p:0,h:[],s:[],b:Array(n).fill(0),k:Array(n).fill(0),n:0,m:''}; for(let i=0;i<n;i++)S.h.push(d.splice(0,n===2?7:5)); S.s=d; for(let i=0;i<n;i++)gfBooks(S,i); S.m=''; gfFix(S); return S; },
    moves:S=>{ if(D.gofish.over(S))return []; const M=[]; for(const r of new Set(S.h[S.p].map(c=>c%13)))for(let t=0;t<S.h.length;t++)if(t!==S.p&&S.h[t].length)M.push([r,t]); return M.length?M:['F']; },
    play:(S,m)=>{ const p=S.p; S.n++; if(m==='F'){ S.m=PN(p)+' FISHES.'; if(S.s.length){ S.h[p].push(S.s.pop()); gfBooks(S,p); } gfNext(S); return S; }
      const [r,t]=m, got=S.h[t].filter(c=>c%13===r); S.k[p]|=1<<r;
      if(got.length){ S.h[t]=S.h[t].filter(c=>c%13!==r); S.h[p].push(...got); S.k[t]&=~(1<<r); S.m=PN(p)+' TAKES '+got.length+' '+RN(r)+(got.length>1?'S':'')+' FROM '+PN(t)+'.'; gfBooks(S,p); gfFix(S); return S; }
      S.m=PN(t)+' HAS NO '+RN(r)+'S. GO FISH!'; if(S.s.length){ const c=S.s.pop(); S.h[p].push(c); if(c%13===r){ S.m+=' '+PN(p)+' FISHED ONE: AGAIN.'; gfBooks(S,p); gfFix(S); return S; } gfBooks(S,p); } gfNext(S); return S; },
    over:S=>S.b.reduce((a,b)=>a+b,0)===13||S.n>=400?top(S.b,'BOOKS'):null,
    // ask whoever is known to hold the rank, else for the rank you hold most of, of the fullest hand
    ai:(S,rnd)=>{ const M=D.gofish.moves(S); if(M[0]==='F')return 'F'; const h=S.h[S.p]; let best=null, bv=-1;
      for(const [r,t] of M){ const v=((S.k[t]>>r)&1)*100+h.filter(c=>c%13===r).length*10+S.h[t].length+rnd(); if(v>bv){ bv=v; best=[r,t]; } } return best; },
    status:S=>'BOOKS '+S.b.join(' · ')+'.',
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const n=S.h.length, mine=me>=0&&S.p===me&&!D.gofish.over(S), b=me<0?0:me;
      for(const [i,s] of around(n,me))backs(g,S.h[i].length,s,PN(i)+' · '+S.h[i].length+' · '+S.b[i]+' BOOKS',S.p===i);
      if(S.s.length)for(let i=0;i<Math.min(5,Math.ceil(S.s.length/6));i++)TG.card(g,232+i*3,156-i*3,0,false,{w:56,h:78}); else slot(g,232,156,56,78);
      TG.text(g,'THE POND · '+S.s.length,260,252,{s:12}); if(S.m)wrap(g,S.m.trim(),276);
      myLabel(g,S,me,' · '+S.b[b]+' BOOKS'); myHand(g,S.h[b],me,c=>({sel:ui.sel!=null&&c%13===ui.sel}));
      if(mine){ const M=D.gofish.moves(S); if(M[0]==='F')TG.btn(g,ui,'F',200,326,120,30,'GO FISH');
        else{ const T=M.filter(m=>m[0]===ui.sel).map(m=>m[1]); if(T.length)T.forEach((t,j)=>TG.btn(g,ui,'a'+t,260-T.length*60+j*120+5,326,110,30,'ASK '+PN(t))); else TG.text(g,'PICK A CARD TO ASK FOR.',260,340,{s:12,c:GOLD}); } } },
    click:(S,me,x,y,ui)=>{ const b=TG.hit(ui,x,y); if(b==='F')return ok(D.gofish,S,'F'); if(b&&b[0]==='a')return ok(D.gofish,S,[ui.sel,+b.slice(1)]);
      if(me<0||!S.h[me])return null; const i=fanHit(S.h[me].length,x,y); if(i>=0){ const r=S.h[me][i]%13; ui.sel=ui.sel===r?null:r; } return null; }};

  /* ---------- OLD MAID: one queen out, pairs put down; draw a hidden card from the next player; whoever keeps the odd queen loses ---------- */
  const omPairs=h=>{ const out=[]; for(const c of h){ const j=out.findIndex(x=>x%13===c%13); if(j>=0)out.splice(j,1); else out.push(c); } return out; };
  const omNext=(S,a)=>{ for(let i=1;i<=S.h.length;i++){ const q=(a+i)%S.h.length; if(S.h[q].length)return q; } return a; };
  const omXY=(k,i)=>{ const r=Math.floor(i/11), m=Math.min(11,k-r*11); return [260-(m*36-4)/2+(i%11)*36,140+r*56]; };
  D.oldmaid={name:'Old Maid',kind:'cards',min:2,max:4,help:'One queen is taken out and every pair is put down. In turn, draw a hidden card from the next player; a pair is put down. Whoever is left holding the odd queen is the Old Maid and loses.',
    init:(n,rnd)=>{ const h=Array.from({length:n},()=>[]); TG.deck(rnd).filter(c=>c!==10).forEach((c,i)=>h[i%n].push(c)); const S={p:0,h:h.map(x=>TG.shuffle(omPairs(x),rnd)),m:''}; if(!S.h[0].length)S.p=omNext(S,0); return S; },
    moves:S=>D.oldmaid.over(S)?[]:S.h[omNext(S,S.p)].map((c,i)=>i),
    play:(S,m)=>{ const p=S.p, q=omNext(S,p), c=S.h[q].splice(m,1)[0], h=S.h[p], j=h.findIndex(x=>x%13===c%13); S.m=PN(p)+' DRAWS FROM '+PN(q)+(j>=0?' AND PUTS DOWN A PAIR.':'.');
      if(j>=0)h.splice(j,1); else{ h.push(c); TG.shuffle(h,TG.rng(S)); } S.p=omNext(S,p); return S; },
    over:S=>{ const L=S.h.map((h,i)=>h.length?i:-1).filter(i=>i>=0); if(L.length>1)return null; const o=L[0]; return {win:S.h.map((h,i)=>i).filter(i=>i!==o),text:PN(o)+' IS THE OLD MAID.'}; },
    ai:(S,rnd)=>Math.floor(rnd()*S.h[omNext(S,S.p)].length),
    status:S=>'DRAW FROM '+PN(omNext(S,S.p))+'.',
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H); const n=S.h.length, q=omNext(S,S.p), b=me<0?0:me;
      for(const [i,s] of around(n,me))backs(g,S.h[i].length,s,PN(i)+' · '+S.h[i].length,S.p===i);
      if(!D.oldmaid.over(S)){ TG.text(g,(S.p===me?'DRAW A CARD FROM ':PN(S.p)+' DRAWS FROM ')+(q===me?'YOU':PN(q)),260,122,{b:1,c:GOLD}); const k=S.h[q].length;
        for(let i=0;i<k;i++){ const [x,y]=omXY(k,i), hov=S.p===me&&ui.mx>=x&&ui.mx<x+32&&ui.my>=y&&ui.my<y+46; TG.card(g,x,y,0,false,{w:32,h:46,sel:hov}); } }
      if(S.m)wrap(g,S.m,272); myLabel(g,S,me,' · '+S.h[b].length); myHand(g,S.h[b],me); },
    click:(S,me,x,y)=>{ if(S.p!==me||D.oldmaid.over(S))return null; const k=S.h[omNext(S,S.p)].length; for(let i=k-1;i>=0;i--){ const [cx,cy]=omXY(k,i); if(x>=cx&&x<cx+32&&y>=cy-8&&y<cy+46)return ok(D.oldmaid,S,i); } return null; }};

  /* ---------- BLACKJACK: everyone against the house's dealer; nearest 21 without going over; five hands, most chips wins ---------- */
  const BV=h=>{ let t=0, a=0; for(const c of h){ const r=c%13; if(r===12){ t+=11; a++; } else t+=r>=8?10:r+2; } while(t>21&&a){ t-=10; a--; } return {t,soft:a>0}; };
  const bjBJ=h=>h.length===2&&BV(h).t===21;
  const bjNextBet=(S,from)=>{ for(let i=from;i<S.c.length;i++)if(S.c[i]>0)return i; return -1; };
  const bjNextPlay=(S,from)=>{ for(let i=from;i<S.c.length;i++)if(S.bt[i]&&BV(S.h[i]).t<21)return i; return -1; };
  // the dealer turns the hole card, draws to 17 (unless everyone is bust) and pays
  const bjDealer=S=>{ S.ph='done'; if(S.h.some((h,i)=>S.bt[i]&&BV(h).t<=21&&!bjBJ(h)))while(BV(S.dh).t<17)S.dh.push(S.d.pop()); const dv=BV(S.dh).t, dbj=bjBJ(S.dh);
    S.res=S.h.map((h,i)=>{ const b=S.bt[i]; if(!b)return ''; const v=BV(h).t, w=v>21?0:bjBJ(h)&&!dbj?2.5:dbj&&!bjBJ(h)?0:dv>21||v>dv?2:v===dv?1:0, pay=Math.floor(b*w); S.c[i]+=pay;
      return v>21?'BUST -'+b:w===2.5?'BLACKJACK +'+(pay-b):w===2?'WIN +'+b:w===1?'PUSH':'LOSE -'+b; });
    S.p=Math.max(0,bjNextBet(S,0)); };
  const bjDeal=(S,rnd)=>{ S.d=TG.deck(rnd); S.h=S.c.map((c,i)=>S.bt[i]?[S.d.pop(),S.d.pop()]:[]); S.dh=[S.d.pop(),S.d.pop()]; S.ph='play'; const i=bjNextPlay(S,0); if(i<0||bjBJ(S.dh))bjDealer(S); else S.p=i; };
  D.blackjack={name:'Blackjack',kind:'cards',min:1,max:4,help:'Everyone plays the dealer. Bet, then hit for cards or stand, nearest 21 without going over; double takes one card for twice the bet. The dealer draws to 17; blackjack pays 3 to 2. Five hands, most chips wins.',
    init:n=>({p:0,c:Array(n).fill(100),bt:Array(n).fill(0),h:Array.from({length:n},()=>[]),dh:[],d:[],ph:'bet',hn:1,res:Array(n).fill('')}),
    moves:S=>{ if(D.blackjack.over(S))return []; if(S.ph==='done')return ['N']; const c=S.c[S.p];
      if(S.ph==='bet'){ const M=[10,20,50].filter(a=>a<=c).map(a=>'B'+a); return M.length?M:['B'+c]; }
      const M=['H','S']; if(S.h[S.p].length===2&&c>=S.bt[S.p])M.push('D'); return M; },
    play:(S,m)=>{ const rnd=TG.rng(S), p=S.p;
      if(m==='N'){ S.hn++; S.bt=S.bt.map(()=>0); S.h=S.h.map(()=>[]); S.dh=[]; S.d=[]; S.res=S.res.map(()=>''); S.ph='bet'; S.p=Math.max(0,bjNextBet(S,0)); return S; }
      if(m[0]==='B'){ const a=+m.slice(1); S.bt[p]=a; S.c[p]-=a; const i=bjNextBet(S,p+1); if(i<0)bjDeal(S,rnd); else S.p=i; return S; }
      if(m==='D'){ S.c[p]-=S.bt[p]; S.bt[p]*=2; S.h[p].push(S.d.pop()); } else if(m==='H')S.h[p].push(S.d.pop());
      if(m!=='H'||BV(S.h[p]).t>=21){ const i=bjNextPlay(S,p+1); if(i<0)bjDealer(S); else S.p=i; } return S; },
    over:S=>S.ph==='done'&&(S.hn>=5||S.c.every(x=>x<=0))?top(S.c,'CHIPS'):null,
    // bet ten; play the basic chart: stand on 17, on 13 to 16 against a weak dealer card, double 10 or 11 against a lower one
    ai:S=>{ if(S.ph==='done')return 'N'; if(S.ph==='bet')return D.blackjack.moves(S)[0];
      const {t,soft}=BV(S.h[S.p]), u=BV([S.dh[0]]).t, dbl=D.blackjack.moves(S).includes('D');
      if(soft)return t>=19||t===18&&u<9?'S':'H'; if(t>=17||t>=13&&u<=6||t===12&&u>=4&&u<=6)return 'S'; if((t===10||t===11)&&u<t&&dbl)return 'D'; return 'H'; },
    status:S=>'HAND '+S.hn+' OF 5 · '+(S.ph==='bet'?'PLACE A BET.':S.ph==='play'?'HIT OR STAND ON '+BV(S.h[S.p]).t+'.':'NEXT HAND.'),
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H,'#1d4f33'); const n=S.c.length, hide=S.ph==='play', sw=128, x0=(520-n*sw)/2;
      TG.text(g,'DEALER'+(S.dh.length&&!hide?' · '+BV(S.dh).t:''),260,20,{b:1,serif:1,s:16});
      S.dh.forEach((c,i)=>TG.card(g,260-(S.dh.length*50-6)/2+i*50,36,c,!(hide&&i===1),{w:44,h:62})); if(!S.dh.length)slot(g,238,36,44,62);
      TG.text(g,'HAND '+S.hn+' OF 5 · DEALER STANDS ON 17',260,122,{s:12,c:'#e8d6a8'});
      for(let i=0;i<n;i++){ const x=x0+i*sw, turn=S.p===i&&S.ph!=='done', k=S.h[i].length; g.fillStyle=turn?'rgba(240,192,64,.25)':'rgba(0,0,0,.18)'; g.fillRect(x+3,296,sw-6,216);
        TG.text(g,(i===me?'YOU':PN(i))+' · '+S.c[i],x+sw/2,312,{b:1,c:turn?GOLD:CREAM}); if(S.bt[i])TG.text(g,'BET '+S.bt[i],x+sw/2,330,{s:12});
        S.h[i].forEach((c,j)=>TG.card(g,x+10+j*Math.min(18,(sw-56)/Math.max(1,k-1)),346,c,true,{w:36,h:50})); if(k)TG.text(g,''+BV(S.h[i]).t,x+sw/2,416,{b:1,s:18});
        if(S.res[i])TG.text(g,S.res[i],x+sw/2,444,{b:1,s:12,c:GOLD}); if(!S.c[i]&&!S.bt[i])TG.text(g,'OUT OF CHIPS',x+sw/2,470,{s:11}); }
      if(me>=0&&S.p===me&&!D.blackjack.over(S)){ const M=D.blackjack.moves(S), L=M.map(m=>[m,m[0]==='B'?'BET '+m.slice(1):{H:'HIT',S:'STAND',D:'DOUBLE',N:'NEXT HAND'}[m]]);
        L.forEach(([m,t],j)=>TG.btn(g,ui,m,260-L.length*60+j*120+5,200,110,34,t)); } },
    click:(S,me,x,y,ui)=>{ const b=TG.hit(ui,x,y); return b&&S.p===me?ok(D.blackjack,S,b):null; }};
  return D; });
