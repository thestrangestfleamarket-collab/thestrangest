// THE CAFÉ'S STRATEGY GAMES (TG, 144cc): two-player board games of pure skill, each its rules, the computer's play and its board drawn for the table window.
import {TG} from './144cc-tables.js';
TG.lib.push(()=>{ '@tables'; const D={};
  /* ---------- TIC-TAC-TOE: three in a row on a 3x3 board ---------- */
  const L3=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const ttWin=b=>{ for(const [a,c,d] of L3)if(b[a]!=='.'&&b[a]===b[c]&&b[a]===b[d])return b[a]; return b.includes('.')?null:'='; };
  D.tictactoe={name:'Tic-tac-toe',kind:'board',min:2,max:2,help:'Take turns marking a square; three in a row wins.',
    init:()=>({b:'.........',p:0}),
    moves:S=>ttWin(S.b)?[]:[...S.b].map((c,i)=>c==='.'?i:-1).filter(i=>i>=0),
    play:(S,m)=>{ S.b=S.b.slice(0,m)+'XO'[S.p]+S.b.slice(m+1); S.p=1-S.p; return S; },
    over:S=>{ const w=ttWin(S.b); return w?{win:w==='='?[]:[w==='X'?0:1],text:w==='='?'A DRAW.':(w==='X'?'X':'O')+' WINS.'}:null; },
    score:(S,p)=>{ const w=ttWin(S.b); return w==='XO'[p]?100:w&&w!=='='?-100:(S.b[4]==='XO'[p]?1:0); },
    draw:(g,S,me,ui,W,H)=>{ g.fillStyle='#e8d6a8'; g.fillRect(0,0,W,H); const c=W/3; g.strokeStyle='#3b2a1e'; g.lineWidth=6;
      for(let i=1;i<3;i++){ g.beginPath(); g.moveTo(i*c,20); g.lineTo(i*c,H-20); g.moveTo(20,i*c); g.lineTo(W-20,i*c); g.stroke(); }
      [...S.b].forEach((v,i)=>{ if(v!=='.')TG.text(g,v,(i%3+.5)*c,(Math.floor(i/3)+.5)*c,{s:110,c:v==='X'?'#7a2430':'#1f4a6a',serif:1,b:1}); }); },
    click:(S,me,x,y,ui,W=520)=>{ const c=W/3, i=Math.floor(y/c)*3+Math.floor(x/c); return i>=0&&i<9&&S.b[i]==='.'?i:null; }};

  /* ---------- shared: the wooden board, discs, the eight steps, a two-ply search ---------- */
  const sub=(s,i,c)=>s.slice(0,i)+c+s.slice(i+1);
  const sd=c=>c==='.'||c==='#'?-1:c<'a'?0:1;
  const K8=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]], RD=[[-1,0],[1,0],[0,-1],[0,1]], BD=[[-1,-1],[-1,1],[1,-1],[1,1]], N8=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const wood=(g,W,H)=>{ g.fillStyle='#6e4626'; g.fillRect(0,0,W,H); g.fillStyle='rgba(0,0,0,.09)'; for(let y=0;y<H;y+=9)g.fillRect(0,y+(y*7)%4,W,2); };
  const disc=(g,x,y,r,f,l='#2a1a10',w=2)=>{ g.beginPath(); g.arc(x,y,r,0,7); g.fillStyle=f; g.fill(); if(l){ g.lineWidth=w; g.strokeStyle=l; g.stroke(); } };
  const box=(g,x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };
  const line=(g,x0,y0,x1,y1,c,w=2)=>{ g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.strokeStyle=c; g.lineWidth=w; g.stroke(); };
  const HL='rgba(240,200,60,.6)', TGT='rgba(60,190,90,.75)';
  // the best move against the opponent's best answer (ev scores a state for p, wins included)
  const mm2=(S,mv,doM,ev,rnd,k=.5)=>{ const me=S.p, M=mv(S); let best=M[0],bv=-1e18; for(const m of M){ const S1=doM(S,m), R=mv(S1); let v=1e18; if(!R.length)v=ev(S1,me); else for(const r of R){ const x=ev(doM(S1,r),me); if(x<v){ v=x; if(v<=bv)break; } } v+=rnd()*k; if(v>bv){ bv=v; best=m; } } return best; };
  const nearPt=(x,y,X,Y,n,m,r)=>{ const c=Math.round((x-X[0])/X[1]), q=Math.round((y-Y[0])/Y[1]); return c>=0&&c<n&&q>=0&&q<m&&Math.hypot(x-X[0]-c*X[1],y-Y[0]-q*Y[1])<r?[q,c]:null; };

  /* ---------- CHESS: full rules; a move is from+to*64+promotion*4096 (queen, rook, bishop, knight) ---------- */
  const CHG={k:'♚︎',q:'♛︎',r:'♜︎',b:'♝︎',n:'♞︎',p:'♟︎'}, CHV={p:100,n:300,b:315,r:500,q:900,k:0};
  const chAtt=(b,s,by)=>{ const r=s>>3,c=s&7,P=by?'pnbrqk':'PNBRQK', at=(y,x)=>y>=0&&y<8&&x>=0&&x<8?b[y*8+x]:'#';
    for(const [dr,dc] of N8)if(at(r+dr,c+dc)===P[1])return true;
    for(const [dr,dc] of K8)if(at(r+dr,c+dc)===P[5])return true;
    const pr=by?r-1:r+1; if(at(pr,c-1)===P[0]||at(pr,c+1)===P[0])return true;
    for(const [dr,dc] of K8){ const sl=dr&&dc?P[2]:P[3]; let y=r+dr,x=c+dc,q; while((q=at(y,x))==='.'){ y+=dr; x+=dc; } if(q===sl||q===P[4])return true; }
    return false; };
  const chGen=(S,col,cast=1)=>{ const b=S.b,M=[]; for(let s=0;s<64;s++){ const pc=b[s]; if(sd(pc)!==col)continue; const r=s>>3,c=s&7,t=pc.toLowerCase(),
      add=(y,x)=>{ if(y<0||y>7||x<0||x>7)return 0; const o=sd(b[y*8+x]); if(o===col)return 0; M.push(s+(y*8+x)*64); return o<0; };
    if(t==='p'){ const d=col?1:-1, y=r+d, pm=to=>{ if(y===(col?7:0))for(let k=0;k<4;k++)M.push(s+to*64+k*4096); else M.push(s+to*64); };
      if(y<0||y>7)continue;
      if(b[y*8+c]==='.'){ pm(y*8+c); if(r===(col?1:6)&&b[(y+d)*8+c]==='.')M.push(s+((y+d)*8+c)*64); }
      for(const x of [c-1,c+1])if(x>=0&&x<8){ const to=y*8+x; if(sd(b[to])===1-col||to===S.e)pm(to); } }
    else if(t==='n'){ for(const [dr,dc] of N8)add(r+dr,c+dc); }
    else if(t==='k'){ for(const [dr,dc] of K8)add(r+dr,c+dc);
      const e=1-col, R=col?'r':'R', ch=col?'kq':'KQ';
      if(cast&&s===(col?4:60)&&!chAtt(b,s,e)){ if(S.c.includes(ch[0])&&b[s+1]==='.'&&b[s+2]==='.'&&b[s+3]===R&&!chAtt(b,s+1,e))M.push(s+(s+2)*64);
        if(S.c.includes(ch[1])&&b[s-1]==='.'&&b[s-2]==='.'&&b[s-3]==='.'&&b[s-4]===R&&!chAtt(b,s-1,e))M.push(s+(s-2)*64); } }
    else for(const [dr,dc] of K8){ if(t==='r'&&dr&&dc||t==='b'&&!(dr&&dc))continue; let y=r+dr,x=c+dc; while(add(y,x)){ y+=dr; x+=dc; } } }
    return M; };
  const chDo=(S,m)=>{ const f=m&63,t=m>>6&63,k=m>>12,b=[...S.b],pc=b[f],col=sd(pc),lo=pc.toLowerCase(); let cap=b[t]!=='.';
    b[t]=pc; b[f]='.';
    if(lo==='p'){ if(t===S.e&&!cap){ b[t+(col?-8:8)]='.'; cap=true; } if((t>>3)===(col?7:0))b[t]=(col?'qrbn':'QRBN')[k]; }
    if(lo==='k'&&Math.abs(t-f)===2){ const rf=t>f?f+3:f-4; b[t>f?f+1:f-1]=b[rf]; b[rf]='.'; }
    let c=S.c; for(const [q,x] of [[60,'KQ'],[4,'kq'],[63,'K'],[56,'Q'],[7,'k'],[0,'q']])if(f===q||t===q)for(const ch of x)c=c.replace(ch,'');
    return {...S,b:b.join(''),c,e:lo==='p'&&Math.abs(t-f)===16?(f+t)/2:-1,h:lo==='p'||cap?0:S.h+1,n:S.n+1,p:1-col}; };
  const chCheck=S=>chAtt(S.b,S.b.indexOf(S.p?'k':'K'),1-S.p);
  const chLegal=S=>chGen(S,S.p).filter(m=>{ const T=chDo(S,m); return !chAtt(T.b,T.b.indexOf(S.p?'k':'K'),1-S.p); });
  const chEnd=S=>{ if(!chLegal(S).length)return chCheck(S)?{win:[1-S.p],text:(S.p?'WHITE':'BLACK')+' WINS BY CHECKMATE.'}:{win:[],text:'STALEMATE: A DRAW.'};
    if(S.h>=100)return {win:[],text:'FIFTY MOVES WITHOUT A CAPTURE: A DRAW.'}; if(S.n>=300)return {win:[],text:'300 MOVES: A DRAW.'};
    if(!/[pqrPQR]/.test(S.b)&&S.b.replace(/[.kK]/g,'').length<2)return {win:[],text:'TOO FEW PIECES TO MATE: A DRAW.'}; return null; };
  const chEval=(S,p)=>{ let v=0; for(let s=0;s<64;s++){ const q=S.b[s]; if(q==='.')continue; const o=sd(q), lo=q.toLowerCase(), r=s>>3, c=s&7; let x=CHV[lo];
      if(lo==='p')x+=(o?r-1:6-r)*8; else if(lo==='n'||lo==='b')x+=12-(Math.abs(c-3.5)+Math.abs(r-3.5))*3; v+=o===p?x:-x; }
    return v+4*(chGen(S,p,0).length-chGen(S,1-p,0).length); };
  D.chess={name:'Chess',kind:'board',min:2,max:2,help:'White moves first; checkmate the other king. Castling, en passant and promotion (pick Q, R, B or N) are allowed; fifty moves without a capture or pawn move is a draw.',
    init:()=>({b:'rnbqkbnrpppppppp'+'.'.repeat(32)+'PPPPPPPPRNBQKBNR',c:'KQkq',e:-1,h:0,n:0,p:0,l:-1}),
    moves:S=>chEnd(S)?[]:chLegal(S),
    play:(S,m)=>{ const T=chDo(S,m); T.l=m; return T; },
    over:chEnd,
    ai:(S,rnd)=>{ const me=S.p, M=chLegal(S); let best=M[0],bv=-1e18;
      for(const m of M){ const S1=chDo(S,m), R=chLegal(S1); let v=1e18;
        if(!R.length)v=chCheck(S1)?1e7:(chEval(S1,me)>0?-1e5:1e5);
        else{ R.sort((a,b)=>(S1.b[b>>6&63]!=='.')-(S1.b[a>>6&63]!=='.')); for(const r of R){ const x=chEval(chDo(S1,r),me); if(x<v){ v=x; if(v<=bv)break; } } }
        v+=rnd()*6; if(v>bv){ bv=v; best=m; } } return best; },
    status:S=>chCheck(S)?'CHECK.':'',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=58,ox=28,oy=6,fl=me===1, at=s=>{ let r=s>>3,c=s&7; if(fl){ r=7-r; c=7-c; } return [ox+c*z,oy+r*z]; },
      my=me===S.p&&!chEnd(S), M=my?chLegal(S):[], T=ui.sel!=null?M.filter(m=>(m&63)===ui.sel):[], ck=chCheck(S)?S.b.indexOf(S.p?'k':'K'):-1;
      box(g,ox-5,oy-5,8*z+10,8*z+10,'#2a1a10');
      for(let s=0;s<64;s++){ const [x,y]=at(s); box(g,x,y,z,z,((s>>3)+(s&7))%2?'#a8743f':'#ecd9b0');
        if(S.l>=0&&(s===(S.l&63)||s===(S.l>>6&63)))box(g,x,y,z,z,'rgba(220,190,60,.35)'); if(my&&s===ui.sel)box(g,x,y,z,z,HL); if(s===ck)box(g,x,y,z,z,'rgba(200,40,40,.6)'); }
      g.save(); g.font='50px serif'; g.textAlign='center'; g.textBaseline='middle'; g.lineWidth=3;
      for(let s=0;s<64;s++){ const q=S.b[s]; if(q==='.')continue; const [x,y]=at(s), t=CHG[q.toLowerCase()], o=sd(q);
        g.strokeStyle=o?'#e8d6a8':'#1c120a'; g.strokeText(t,x+z/2,y+z/2+3); g.fillStyle=o?'#18120e':'#fbf6ea'; g.fillText(t,x+z/2,y+z/2+3); }
      g.restore();
      for(const m of T){ const [x,y]=at(m>>6&63); disc(g,x+z/2,y+z/2,9,TGT,null); }
      if(T.some(m=>m>>12)){ TG.text(g,'PROMOTE TO',90,497,{s:13,b:1}); 'QRBN'.split('').forEach((L,k)=>TG.btn(g,ui,'pr'+k,170+k*56,482,50,30,(ui.pr||0)===k?'['+L+']':L)); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const b=TG.hit(ui,x,y); if(b&&b.startsWith('pr')){ ui.pr=+b[2]; return null; }
      const z=58,ox=28,oy=6; let c=Math.floor((x-ox)/z), r=Math.floor((y-oy)/z); if(c<0||c>7||r<0||r>7){ ui.sel=null; return null; } if(me===1){ r=7-r; c=7-c; }
      const s=r*8+c, M=D.chess.moves(S);
      if(ui.sel!=null){ const f=M.filter(m=>(m&63)===ui.sel&&(m>>6&63)===s); if(f.length){ const m=f.find(m=>m>>12===(ui.pr||0))??f[0]; ui.sel=null; ui.pr=0; return m; } }
      ui.sel=M.some(m=>(m&63)===s)?s:null; return null; }};

  /* ---------- CHECKERS: English draughts; captures are forced and a chain of jumps is one move (a list of squares) ---------- */
  const ckGen=(b,p)=>{ const mine=p?'oO':'xX', foe=p?'xX':'oO', fw=p?1:-1, J=[], St=[];
    for(let s=0;s<64;s++){ const q=b[s]; if(q!==mine[0]&&q!==mine[1])continue; const king=q===mine[1], dirs=king?BD:[[fw,-1],[fw,1]];
      const jump=(bb,at,path)=>{ let any=false; const r=at>>3,c=at&7; for(const [dr,dc] of dirs){ const y=r+2*dr,x=c+2*dc; if(y<0||y>7||x<0||x>7)continue; const mid=(r+dr)*8+c+dc, to=y*8+x;
          if(foe.includes(bb[mid])&&bb[to]==='.'){ any=true; const nb=sub(sub(sub(bb,at,'.'),mid,'.'),to,q); if(!king&&y===(p?7:0)||!jump(nb,to,[...path,to]))J.push([...path,to]); } } return any; };
      jump(b,s,[s]);
      if(!J.length)for(const [dr,dc] of dirs){ const y=(s>>3)+dr,x=(s&7)+dc; if(y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]==='.')St.push([s,y*8+x]); } }
    return J.length?J:St; };
  const ckDo=(S,m)=>{ let b=S.b; const q=b[m[0]]; let cap=false; b=sub(b,m[0],'.');
    for(let i=1;i<m.length;i++)if(Math.abs((m[i]>>3)-(m[i-1]>>3))===2){ b=sub(b,(m[i]+m[i-1])/2,'.'); cap=true; }
    const t=m[m.length-1]; b=sub(b,t,(t>>3)===(S.p?7:0)?q.toUpperCase():q); return {...S,b,p:1-S.p,q:cap?0:S.q+1,n:S.n+1}; };
  const ckEnd=S=>!ckGen(S.b,S.p).length?{win:[1-S.p],text:(S.p?'RED':'WHITE')+' WINS.'}:S.q>=80?{win:[],text:'FORTY MOVES WITHOUT A CAPTURE: A DRAW.'}:S.n>=600?{win:[],text:'A DRAW.'}:null;
  const ckEval=(S,p)=>{ const o=ckEnd(S); if(o)return o.win.length?(o.win[0]===p?1e6:-1e6):0; let v=0;
    for(let s=0;s<64;s++){ const q=S.b[s]; if(q==='.')continue; const w=q==='o'||q==='O'?1:0, r=s>>3; const x=q==='x'?100+(7-r)*3:q==='o'?100+r*3:160; v+=w===p?x:-x; } return v; };
  D.checkers={name:'Checkers',kind:'board',min:2,max:2,help:'Move diagonally forward; jump to capture, and you must jump when you can, chaining jumps. Reach the far row to be kinged; take or block every piece to win.',
    init:()=>{ let b=''; for(let s=0;s<64;s++){ const r=s>>3,c=s&7; b+=(r+c)%2?(r<3?'o':r>4?'x':'.'):'.'; } return {b,p:0,q:0,n:0}; },
    moves:S=>ckEnd(S)?[]:ckGen(S.b,S.p),
    play:(S,m)=>{ const T=ckDo(S,m); T.l=m[m.length-1]; return T; },
    over:ckEnd,
    ai:(S,rnd)=>mm2(S,s=>ckEnd(s)?[]:ckGen(s.b,s.p),ckDo,ckEval,rnd,2),
    status:S=>{ const n=[...S.b].filter(q=>q!=='.'); return 'RED '+n.filter(q=>q==='x'||q==='X').length+' · WHITE '+n.filter(q=>q==='o'||q==='O').length+'.'; },
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=60,o=20,fl=me===1, at=s=>{ let r=s>>3,c=s&7; if(fl){ r=7-r; c=7-c; } return [o+c*z,o+r*z]; },
      my=me===S.p&&!ckEnd(S), M=my?ckGen(S.b,S.p):[], T=M.filter(m=>m[0]===ui.sel);
      box(g,o-5,o-5,8*z+10,8*z+10,'#2a1a10');
      for(let s=0;s<64;s++){ const [x,y]=at(s); box(g,x,y,z,z,((s>>3)+(s&7))%2?'#3c5a3a':'#e8d6a8'); if(my&&(s===ui.sel||ui.sel==null&&M.some(m=>m[0]===s)))box(g,x,y,z,z,s===ui.sel?HL:'rgba(240,200,60,.25)'); }
      for(let s=0;s<64;s++){ const q=S.b[s]; if(q==='.')continue; const [x,y]=at(s), w=q.toLowerCase()==='o';
        disc(g,x+z/2,y+z/2+3,24,'rgba(0,0,0,.4)',null); disc(g,x+z/2,y+z/2,24,w?'#efe6cf':'#b02a2a','#2a1a10',2); disc(g,x+z/2,y+z/2,16,w?'#ddd2b4':'#922020',null);
        if(q<'a')TG.text(g,'♛︎',x+z/2,y+z/2+1,{s:22,c:w?'#7a5a20':'#f0d070',serif:1}); if(s===S.l)disc(g,x+z/2,y+z/2,5,'#f0d070',null); }
      for(const m of T){ const [x,y]=at(m[m.length-1]); disc(g,x+z/2,y+z/2,10,TGT,null); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; let c=Math.floor((x-20)/60), r=Math.floor((y-20)/60); if(c<0||c>7||r<0||r>7){ ui.sel=null; return null; } if(me===1){ r=7-r; c=7-c; }
      const s=r*8+c, M=D.checkers.moves(S); if(ui.sel!=null){ const m=M.find(m=>m[0]===ui.sel&&m[m.length-1]===s); if(m){ ui.sel=null; return m; } }
      ui.sel=M.some(m=>m[0]===s)?s:null; return null; }};

  /* ---------- REVERSI: outflank to turn discs; pass when you cannot move; most discs wins ---------- */
  const RVW=(()=>{ const q=[[100,-20,10,5],[-20,-50,-2,-2],[10,-2,1,1],[5,-2,1,0]], w=[]; for(let s=0;s<64;s++){ const r=s>>3,c=s&7; w.push(q[r<4?r:7-r][c<4?c:7-c]); } return w; })();
  const rvFlips=(b,s,p)=>{ if(b[s]!=='.')return []; const r=s>>3,c=s&7,P='XO'[p],O='XO'[1-p],F=[];
    for(const [dr,dc] of K8){ let y=r+dr,x=c+dc; const L=[]; while(y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]===O){ L.push(y*8+x); y+=dr; x+=dc; } if(L.length&&y>=0&&y<8&&x>=0&&x<8&&b[y*8+x]===P)F.push(...L); } return F; };
  const rvList=(b,p)=>{ const M=[]; for(let s=0;s<64;s++)if(b[s]==='.'&&rvFlips(b,s,p).length)M.push(s); return M; };
  const rvMoves=S=>{ const M=rvList(S.b,S.p); return M.length?M:rvList(S.b,1-S.p).length?['pass']:[]; };
  const rvDo=(S,m)=>{ let b=S.b; if(m!=='pass'){ const P='XO'[S.p]; for(const f of rvFlips(b,m,S.p))b=sub(b,f,P); b=sub(b,m,P); } return {...S,b,p:1-S.p,n:S.n+1}; };
  const rvCount=b=>[[...b].filter(q=>q==='X').length,[...b].filter(q=>q==='O').length];
  const rvEnd=S=>{ if(rvMoves(S).length)return null; const [x,o]=rvCount(S.b); return {win:x===o?[]:[x>o?0:1],text:x===o?'A DRAW, '+x+' EACH.':(x>o?'BLACK':'WHITE')+' WINS '+Math.max(x,o)+' TO '+Math.min(x,o)+'.'}; };
  const rvEval=(S,p)=>{ const o=rvEnd(S); if(o){ const n=rvCount(S.b); return (n[p]-n[1-p])*1e4; } let v=0; const P='XO'[p];
    for(let s=0;s<64;s++)if(S.b[s]!=='.')v+=S.b[s]===P?RVW[s]:-RVW[s]; return v+5*(rvList(S.b,p).length-rvList(S.b,1-p).length); };
  D.reversi={name:'Reversi',kind:'board',min:2,max:2,help:'Place a disc so it traps a line of the other colour between two of yours; they turn over. No move means you pass; most discs at the end wins.',
    init:()=>{ const b=[...'.'.repeat(64)]; b[27]=b[36]='O'; b[28]=b[35]='X'; return {b:b.join(''),p:0,n:0}; },
    moves:rvMoves, play:(S,m)=>{ const T=rvDo(S,m); T.l=m; return T; }, over:rvEnd,
    ai:(S,rnd)=>mm2(S,rvMoves,rvDo,rvEval,rnd,1),
    status:S=>{ const [x,o]=rvCount(S.b); return 'BLACK '+x+' · WHITE '+o+'.'+(rvMoves(S)[0]==='pass'?' NO MOVE: PASS.':''); },
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=58,o=28; box(g,o-5,o-6,8*z+10,8*z+10,'#2a1a10'); g.save(); g.translate(o,o-1); TG.felt(g,8*z,8*z); g.restore();
      for(let i=0;i<=8;i++){ line(g,o+i*z,o-1,o+i*z,o-1+8*z,'#123a24',2); line(g,o,o-1+i*z,o+8*z,o-1+i*z,'#123a24',2); }
      const my=me===S.p&&!rvEnd(S), M=my?rvMoves(S):[];
      for(let s=0;s<64;s++){ const x=o+(s&7)*z+z/2, y=o-1+(s>>3)*z+z/2, q=S.b[s];
        if(q!=='.'){ disc(g,x,y+3,23,'rgba(0,0,0,.4)',null); disc(g,x,y,23,q==='X'?'#1c1c22':'#f4efe0','#0a0a0a',1.5); if(s===S.l)disc(g,x,y,5,'#e0a020',null); }
        else if(M.includes(s))disc(g,x,y,7,'rgba(240,210,90,.8)',null); }
      if(M[0]==='pass')TG.btn(g,ui,'pass',210,490,100,26,'PASS'); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const M=D.reversi.moves(S); if(TG.hit(ui,x,y)==='pass')return M[0]==='pass'?'pass':null;
      const c=Math.floor((x-28)/58), r=Math.floor((y-27)/58), s=r*8+c; return c>=0&&c<8&&r>=0&&r<8&&M.includes(s)?s:null; }};

  /* ---------- GO: 9x9, captures, no suicide, simple ko; two passes end it; area scoring, komi 6.5 ---------- */
  const NB9=[...Array(81)].map((_,s)=>{ const r=Math.floor(s/9),c=s%9,A=[]; if(r)A.push(s-9); if(r<8)A.push(s+9); if(c)A.push(s-1); if(c<8)A.push(s+1); return A; });
  const goGroup=(b,s)=>{ const col=b[s], G=[s], seen=new Set(G), L=new Set(); for(let i=0;i<G.length;i++)for(const t of NB9[G[i]]){ if(b[t]==='.')L.add(t); else if(b[t]===col&&!seen.has(t)){ seen.add(t); G.push(t); } } return [G,L.size]; };
  const goTry=(b,s,p,ko)=>{ if(b[s]!=='.'||s===ko)return null; const P='XO'[p],O='XO'[1-p], a=[...b]; a[s]=P; let cap=0,last=-1;
    for(const t of NB9[s])if(a[t]===O){ const [G,l]=goGroup(a,t); if(!l){ for(const x of G)a[x]='.'; cap+=G.length; last=G[0]; } }
    const [G,l]=goGroup(a,s); if(!l)return null; return [a.join(''),cap,cap===1&&G.length===1&&l===1?last:-1]; };
  const goArea=b=>{ const sc=[0,6.5], seen=new Set(); for(let s=0;s<81;s++){ if(b[s]==='X')sc[0]++; else if(b[s]==='O')sc[1]++; else if(!seen.has(s)){ const R=[s],tc=new Set(); seen.add(s);
      for(let i=0;i<R.length;i++)for(const t of NB9[R[i]]){ if(b[t]==='.'){ if(!seen.has(t)){ seen.add(t); R.push(t); } } else tc.add(b[t]); } if(tc.size===1)sc[tc.has('X')?0:1]+=R.length; } } return sc; };
  const goEnd=S=>{ if(S.pa<2&&S.n<250)return null; const [x,o]=goArea(S.b); return {win:[x>o?0:1],text:(x>o?'BLACK':'WHITE')+' WINS, '+Math.max(x,o)+' TO '+Math.min(x,o)+'.'}; };
  D.go={name:'Go',kind:'board',min:2,max:2,help:'Place stones on the points; a group with no empty point beside it is captured. Two passes end it: stones plus surrounded points score, and White gets 6.5.',
    init:()=>({b:'.'.repeat(81),p:0,ko:-1,pa:0,n:0,c:[0,0],l:-1}),
    moves:S=>{ if(goEnd(S))return []; const M=[]; for(let s=0;s<81;s++)if(goTry(S.b,s,S.p,S.ko))M.push(s); M.push('pass'); return M; },
    play:(S,m)=>{ if(m==='pass'){ S.pa++; S.ko=-1; S.l=-1; } else { const [b,cap,ko]=goTry(S.b,m,S.p,S.ko); S.b=b; S.ko=ko; S.pa=0; S.c[S.p]+=cap; S.l=m; } S.n++; S.p=1-S.p; return S; },
    over:goEnd,
    ai:(S,rnd)=>{ const p=S.p,P='XO'[p],O='XO'[1-p],b=S.b, own=Array(81).fill(0), rs=Array(81).fill(0), seen=Array(81).fill(0);
      for(let s=0;s<81;s++)if(b[s]==='.'&&!seen[s]){ const R=[s],tc=new Set(); seen[s]=1; for(let i=0;i<R.length;i++)for(const t of NB9[R[i]]){ if(b[t]==='.'){ if(!seen[t]){ seen[t]=1; R.push(t); } } else tc.add(b[t]); }
        const o=tc.size===1?(tc.has(P)?1:2):0; for(const x of R){ own[x]=o; rs[x]=R.length; } }
      const sc=goArea(b); if(S.pa&&sc[p]>sc[1-p])return 'pass';
      let best='pass',bv=1;
      for(let s=0;s<81;s++){ if(b[s]!=='.')continue; const T=goTry(b,s,p,S.ko); if(!T)continue; const [nb,cap]=T, ns=NB9[s]; if(!cap&&ns.every(t=>b[t]===P))continue;
        let v=cap*12; if(!cap&&own[s]===1)v-=6; if(!cap&&own[s]===2&&rs[s]<=4)v-=4;
        for(const t of ns){ if(b[t]===P){ if(goGroup(b,t)[1]===1)v+=8; } else if(b[t]===O&&nb[t]===O){ const l=goGroup(nb,t)[1]; v+=l===1?4:l===2?1:0; } }
        const l=goGroup(nb,s)[1]; if(l===1&&!cap)v-=15; else v+=Math.min(l,4)*.6;
        const r=Math.floor(s/9),c=s%9,ln=Math.min(r,c,8-r,8-c); v+=S.n<16?[-3,0,2.5,2,1.5][ln]:ln?.5:-.5;
        v+=rnd()*.8; if(v>bv){ bv=v; best=s; } }
      return best; },
    status:S=>'CAPTURED: BLACK '+S.c[0]+' · WHITE '+S.c[1]+'.'+(S.pa?' THE LAST MOVE WAS A PASS.':''),
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=50,ox=60,oy=40; box(g,ox-30,oy-30,8*z+60,8*z+60,'#d8b06a');
      for(let i=0;i<9;i++){ line(g,ox+i*z,oy,ox+i*z,oy+8*z,'#3b2a1e',2); line(g,ox,oy+i*z,ox+8*z,oy+i*z,'#3b2a1e',2); }
      for(const s of [20,24,40,56,60])disc(g,ox+s%9*z,oy+Math.floor(s/9)*z,5,'#3b2a1e',null);
      const my=me===S.p&&!goEnd(S);
      for(let s=0;s<81;s++){ const q=S.b[s], x=ox+s%9*z, y=oy+Math.floor(s/9)*z; if(q==='.')continue;
        disc(g,x+2,y+3,22,'rgba(0,0,0,.35)',null); disc(g,x,y,22,q==='X'?'#1c1c22':'#f4efe0','#0a0a0a',1.5); if(s===S.l)disc(g,x,y,6,q==='X'?'#f4efe0':'#1c1c22',null); }
      if(my){ const h=nearPt(ui.mx,ui.my,[ox,z],[oy,z],9,9,24); if(h&&goTry(S.b,h[0]*9+h[1],S.p,S.ko))disc(g,ox+h[1]*z,oy+h[0]*z,20,S.p?'rgba(244,239,224,.5)':'rgba(28,28,34,.5)',null);
        TG.btn(g,ui,'pass',210,480,100,30,'PASS'); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; if(TG.hit(ui,x,y)==='pass')return 'pass'; const h=nearPt(x,y,[60,50],[40,50],9,9,24); if(!h)return null; const s=h[0]*9+h[1]; return goTry(S.b,s,S.p,S.ko)?s:null; }};

  /* ---------- GOMOKU: 15x15, five in a row wins ---------- */
  const GKD=[[0,1],[1,0],[1,1],[1,-1]];
  const gkRun=(b,s,P,dr,dc)=>{ const r=Math.floor(s/15),c=s%15; let n=1,o=0; for(const k of [1,-1]){ let y=r+dr*k,x=c+dc*k; while(y>=0&&y<15&&x>=0&&x<15&&b[y*15+x]===P){ n++; y+=dr*k; x+=dc*k; } if(y>=0&&y<15&&x>=0&&x<15&&b[y*15+x]==='.')o++; } return [n,o]; };
  const gkVal=(b,s,P)=>{ let v=0; for(const [dr,dc] of GKD){ const [n,o]=gkRun(b,s,P,dr,dc); v+=n>=5?1e6:n===4?(o===2?1e5:o?1.2e4:0):n===3?(o===2?4e3:o?300:0):n===2?(o===2?150:o?25:0):o*4; } return v; };
  const gkEnd=S=>{ if(S.l>=0){ const P=S.b[S.l]; if(GKD.some(([dr,dc])=>gkRun(S.b,S.l,P,dr,dc)[0]>=5))return {win:[P==='X'?0:1],text:(P==='X'?'BLACK':'WHITE')+' WINS: FIVE IN A ROW.'}; } return S.b.includes('.')?null:{win:[],text:'THE BOARD IS FULL: A DRAW.'}; };
  D.gomoku={name:'Gomoku',kind:'board',min:2,max:2,help:'Take turns placing a stone on the points; the first to make five in a row, in any direction, wins.',
    init:()=>({b:'.'.repeat(225),p:0,l:-1}),
    moves:S=>gkEnd(S)?[]:[...S.b].map((q,i)=>q==='.'?i:-1).filter(i=>i>=0),
    play:(S,m)=>{ S.b=sub(S.b,m,'XO'[S.p]); S.l=m; S.p=1-S.p; return S; },
    over:gkEnd,
    ai:(S,rnd)=>{ const b=S.b,P='XO'[S.p],O='XO'[1-S.p]; if(S.l<0)return 112; let best=null,bv=-1;
      for(let s=0;s<225;s++){ if(b[s]!=='.')continue; const r=Math.floor(s/15),c=s%15; let near=false; for(let y=Math.max(0,r-2);y<=Math.min(14,r+2)&&!near;y++)for(let x=Math.max(0,c-2);x<=Math.min(14,c+2);x++)if(b[y*15+x]!=='.'){ near=true; break; }
        if(!near)continue; const v=gkVal(b,s,P)*1.15+gkVal(b,s,O)+rnd(); if(v>bv){ bv=v; best=s; } }
      return best; },
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=33,o=29; box(g,o-18,o-18,14*z+36,14*z+36,'#d8b06a');
      for(let i=0;i<15;i++){ line(g,o+i*z,o,o+i*z,o+14*z,'#3b2a1e',1.5); line(g,o,o+i*z,o+14*z,o+i*z,'#3b2a1e',1.5); }
      for(const s of [48,56,112,168,176])disc(g,o+s%15*z,o+Math.floor(s/15)*z,4,'#3b2a1e',null);
      for(let s=0;s<225;s++){ const q=S.b[s]; if(q==='.')continue; const x=o+s%15*z, y=o+Math.floor(s/15)*z; disc(g,x+1,y+2,14,'rgba(0,0,0,.35)',null); disc(g,x,y,14,q==='X'?'#1c1c22':'#f4efe0','#0a0a0a',1.2); if(s===S.l)disc(g,x,y,4,'#c03030',null); }
      if(me===S.p&&!gkEnd(S)){ const h=nearPt(ui.mx,ui.my,[o,z],[o,z],15,15,16); if(h&&S.b[h[0]*15+h[1]]==='.')disc(g,o+h[1]*z,o+h[0]*z,12,S.p?'rgba(244,239,224,.5)':'rgba(28,28,34,.5)',null); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const h=nearPt(x,y,[29,33],[29,33],15,15,16); if(!h)return null; const s=h[0]*15+h[1]; return S.b[s]==='.'?s:null; }};

  /* ---------- FOUR IN A ROW: drop discs into a 7x6 frame; four in a line wins ---------- */
  const C4W=[]; for(let r=0;r<6;r++)for(let c=0;c<7;c++)for(const [dr,dc] of GKD){ const y=r+3*dr,x=c+3*dc; if(y>=0&&y<6&&x>=0&&x<7)C4W.push([0,1,2,3].map(k=>(r+k*dr)*7+c+k*dc)); }
  const c4Win=b=>{ for(const w of C4W){ const q=b[w[0]]; if(q!=='.'&&q===b[w[1]]&&q===b[w[2]]&&q===b[w[3]])return q; } return b.includes('.')?null:'='; };
  const c4Drop=(b,c,p)=>{ for(let r=5;r>=0;r--)if(b[r*7+c]==='.')return sub(b,r*7+c,'RY'[p]); return b; };
  const c4Ev=(b,p)=>{ const P='RY'[p],O='RY'[1-p]; let v=0; for(const w of C4W){ let a=0,o=0; for(const i of w){ if(b[i]===P)a++; else if(b[i]===O)o++; } if(!o)v+=[0,1,5,50][a]; else if(!a)v-=[0,1,6,70][o]; }
    for(let r=0;r<6;r++){ if(b[r*7+3]===P)v+=3; else if(b[r*7+3]===O)v-=3; } return v; };
  const c4Neg=(b,p,d,a,be)=>{ const w=c4Win(b); if(w==='=')return 0; if(w)return w==='RY'[p]?1e6+d:-1e6-d; if(!d)return c4Ev(b,p); let v=-1e9;
    for(const c of [3,2,4,1,5,0,6])if(b[c]==='.'){ const x=-c4Neg(c4Drop(b,c,p),1-p,d-1,-be,-a); if(x>v)v=x; if(v>a)a=v; if(a>=be)break; } return v; };
  D.fourinrow={name:'Four in a Row',kind:'board',min:2,max:2,help:'Drop a disc into a column; it falls to the lowest space. Four of your colour in a line, any direction, wins.',
    init:()=>({b:'.'.repeat(42),p:0,l:-1}),
    moves:S=>c4Win(S.b)?[]:[0,1,2,3,4,5,6].filter(c=>S.b[c]==='.'),
    play:(S,m)=>{ for(let r=5;r>=0;r--)if(S.b[r*7+m]==='.'){ S.l=r*7+m; break; } S.b=c4Drop(S.b,m,S.p); S.p=1-S.p; return S; },
    over:S=>{ const w=c4Win(S.b); return w?{win:w==='='?[]:[w==='R'?0:1],text:w==='='?'THE FRAME IS FULL: A DRAW.':(w==='R'?'RED':'YELLOW')+' WINS.'}:null; },
    ai:(S,rnd)=>{ let best=null,bv=-1e18; for(const c of [3,2,4,1,5,0,6])if(S.b[c]==='.'){ const v=-c4Neg(c4Drop(S.b,c,S.p),1-S.p,3,-1e9,1e9)+rnd()*2; if(v>bv){ bv=v; best=c; } } return best; },
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=66,ox=29,oy=70, my=me===S.p&&!c4Win(S.b);
      const hc=Math.floor((ui.mx-ox)/z); if(my&&hc>=0&&hc<7&&S.b[hc]==='.'){ box(g,ox+hc*z,oy-8,z,6*z+16,'rgba(240,200,60,.25)'); disc(g,ox+hc*z+z/2,oy-34,24,S.p?'#e8c030':'#c02a2a','#2a1a10'); }
      box(g,ox-6,oy-6,7*z+12,6*z+12,'#1f4a8a');
      for(let s=0;s<42;s++){ const q=S.b[s], x=ox+s%7*z+z/2, y=oy+Math.floor(s/7)*z+z/2; disc(g,x,y,25,q==='R'?'#c02a2a':q==='Y'?'#e8c030':'#2a1c12','#123060',3); if(s===S.l)disc(g,x,y,6,'#f4efe0',null); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const c=Math.floor((x-29)/66); return c>=0&&c<7&&S.b[c]==='.'?c:null; }};

  /* ---------- HEX: 9x9; Red joins top and bottom, Blue joins left and right ---------- */
  const HNB=[...Array(81)].map((_,s)=>{ const r=Math.floor(s/9),c=s%9; return [[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0]].filter(([dr,dc])=>r+dr>=0&&r+dr<9&&c+dc>=0&&c+dc<9).map(([dr,dc])=>(r+dr)*9+c+dc); });
  // the fewest empty cells still needed to join p's two sides
  const hxDist=(b,p)=>{ const P='RB'[p], d=Array(81).fill(99), Q=[], cost=s=>b[s]===P?0:b[s]==='.'?1:99, push=(s,k)=>{ if(k<d[s]){ d[s]=k; (Q[k]||(Q[k]=[])).push(s); } };
    for(let i=0;i<9;i++){ const s=p?i*9:i, k=cost(s); if(k<99)push(s,k); }
    for(let k=0;k<Q.length;k++)if(Q[k])for(let i=0;i<Q[k].length;i++){ const s=Q[k][i]; if(d[s]!==k)continue; for(const t of HNB[s]){ const c=cost(t); if(c<99)push(t,k+c); } }
    let m=99; for(let i=0;i<9;i++)m=Math.min(m,d[p?i*9+8:72+i]); return m; };
  const hxEnd=S=>{ for(const p of [0,1])if(hxDist(S.b,p)===0)return {win:[p],text:(p?'BLUE':'RED')+' WINS: THE SIDES ARE JOINED.'}; return null; };
  const HR=21, HW=HR*Math.sqrt(3), hxXY=s=>{ const r=Math.floor(s/9),c=s%9; return [(520-13*HW)/2+HW/2+c*HW+r*HW/2, 260-6*HR+r*1.5*HR]; };
  D.hex={name:'Hex',kind:'board',min:2,max:2,help:'Take turns filling a cell. Red wins by joining the top and bottom edges with a chain, Blue by joining left and right.',
    init:()=>({b:'.'.repeat(81),p:0,l:-1}),
    moves:S=>hxEnd(S)?[]:[...S.b].map((q,i)=>q==='.'?i:-1).filter(i=>i>=0),
    play:(S,m)=>{ S.b=sub(S.b,m,'RB'[S.p]); S.l=m; S.p=1-S.p; return S; },
    over:hxEnd,
    ai:(S,rnd)=>{ const p=S.p; if(!S.b.includes('R')&&!S.b.includes('B'))return 40; if(S.b[40]==='.'&&S.b.replace(/\./g,'').length<2)return 40; let best=null,bv=-1e18;
      for(let s=0;s<81;s++){ if(S.b[s]!=='.')continue; const b=sub(S.b,s,'RB'[p]), me_=hxDist(b,p); const r=Math.floor(s/9),c=s%9;
        const v=me_===0?1e6:hxDist(b,1-p)*10-me_*11-(Math.abs(r-4)+Math.abs(c-4))*.3+rnd(); if(v>bv){ bv=v; best=s; } } return best; },
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const hex=(x,y,f,l)=>{ g.beginPath(); for(let k=0;k<6;k++){ const a=Math.PI/6+k*Math.PI/3; g.lineTo(x+Math.cos(a)*HR,y+Math.sin(a)*HR); } g.closePath(); g.fillStyle=f; g.fill(); g.strokeStyle=l; g.lineWidth=2; g.stroke(); };
      const [ax,ay]=hxXY(0),[bx,by]=hxXY(8),[cx,cy]=hxXY(72),[dx,dy]=hxXY(80);
      line(g,ax,ay-HR-6,bx,by-HR-6,'#c02a2a',8); line(g,cx,cy+HR+6,dx,dy+HR+6,'#c02a2a',8); line(g,ax-HW/2-5,ay,cx-HW/2-5,cy,'#2a5ac0',8); line(g,bx+HW/2+5,by,dx+HW/2+5,dy,'#2a5ac0',8);
      const my=me===S.p&&!hxEnd(S); let hv=-1; if(my)for(let s=0;s<81;s++){ const [x,y]=hxXY(s); if(Math.hypot(ui.mx-x,ui.my-y)<HR*.9)hv=s; }
      for(let s=0;s<81;s++){ const [x,y]=hxXY(s), q=S.b[s]; hex(x,y,q==='R'?'#c02a2a':q==='B'?'#2a5ac0':s===hv&&q==='.'?(S.p?'#9ab0e0':'#e0a0a0'):'#e8d6a8','#3b2a1e'); if(s===S.l)disc(g,x,y,5,'#f4efe0',null); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; for(let s=0;s<81;s++){ const [cx,cy]=hxXY(s); if(Math.hypot(x-cx,y-cy)<HR*.9)return S.b[s]==='.'?s:null; } return null; }};

  /* ---------- FOX AND GEESE: the cross board; 13 geese (never backwards) trap the fox, the fox jumps geese to take them ---------- */
  const FGok=(r,c)=>r>=0&&r<7&&c>=0&&c<7&&(r>=2&&r<=4||c>=2&&c<=4);
  const fgGen=(b,p)=>{ const M=[]; for(let s=0;s<49;s++){ const q=b[s], r=Math.floor(s/7), c=s%7;
      if(p===0&&q==='G'){ for(const [dr,dc] of [[-1,0],[0,-1],[0,1]])if(FGok(r+dr,c+dc)&&b[(r+dr)*7+c+dc]==='.')M.push([s,(r+dr)*7+c+dc]); }
      else if(p===1&&q==='F'){ for(const [dr,dc] of RD){ if(!FGok(r+dr,c+dc))continue; const t=(r+dr)*7+c+dc; if(b[t]==='.')M.push([s,t]); else if(b[t]==='G'&&FGok(r+2*dr,c+2*dc)&&b[(r+2*dr)*7+c+2*dc]==='.')M.push([s,(r+2*dr)*7+c+2*dc]); } } }
    return M; };
  const fgDo=(S,m)=>{ let b=sub(sub(S.b,m[1],S.b[m[0]]),m[0],'.'); const d=Math.abs(m[1]-m[0]); if(d===2||d===14)b=sub(b,(m[0]+m[1])/2,'.'); return {...S,b,p:1-S.p,n:S.n+1}; };
  const fgEnd=S=>{ const n=[...S.b].filter(q=>q==='G').length; if(n<5)return {win:[1],text:'THE FOX WINS.'}; if(!fgGen(S.b,S.p).length)return S.p?{win:[0],text:'THE GEESE TRAP THE FOX.'}:{win:[1],text:'THE GEESE ARE STUCK: THE FOX WINS.'}; return S.n>=200?{win:[],text:'200 MOVES: A DRAW.'}:null; };
  const fgEval=(S,p)=>{ const o=fgEnd(S); if(o)return o.win.length?(o.win[0]===p?1e5:-1e5):0; const F=fgGen(S.b,1); let v=[...S.b].filter(q=>q==='G').length*30-F.length*4-F.filter(m=>[2,14].includes(Math.abs(m[1]-m[0]))).length*14;
    for(let s=0;s<49;s++)if(S.b[s]==='G')v+=(6-Math.floor(s/7))*.4; return p?-v:v; };
  const FGZ=66, fgXY=s=>[62+s%7*FGZ,62+Math.floor(s/7)*FGZ];
  D.foxgeese={name:'Fox and Geese',kind:'board',min:2,max:2,help:'Geese move one step forward or sideways; the fox steps any way along the lines or jumps a goose to take it. The geese win by trapping the fox; the fox wins when fewer than five geese are left.',
    init:()=>{ let b=''; for(let s=0;s<49;s++){ const r=Math.floor(s/7),c=s%7; b+=!FGok(r,c)?'#':r===4||r>4&&c>=2&&c<=4?'G':r===3&&c===3?'F':'.'; } return {b,p:0,n:0}; },
    moves:S=>fgEnd(S)?[]:fgGen(S.b,S.p),
    play:(S,m)=>{ const T=fgDo(S,m); T.l=m[1]; return T; },
    over:fgEnd,
    ai:(S,rnd)=>mm2(S,s=>fgEnd(s)?[]:fgGen(s.b,s.p),fgDo,fgEval,rnd,1),
    status:S=>'GEESE LEFT: '+[...S.b].filter(q=>q==='G').length+'.',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); box(g,62-36+2*FGZ,62-36,2*FGZ+72,6*FGZ+72,'#d8b06a'); box(g,62-36,62-36+2*FGZ,6*FGZ+72,2*FGZ+72,'#d8b06a');
      for(let s=0;s<49;s++){ const r=Math.floor(s/7),c=s%7; if(!FGok(r,c))continue; const [x,y]=fgXY(s); if(FGok(r,c+1))line(g,x,y,x+FGZ,y,'#3b2a1e',3); if(FGok(r+1,c))line(g,x,y,x,y+FGZ,'#3b2a1e',3); }
      const my=me===S.p&&!fgEnd(S), M=my?fgGen(S.b,S.p):[], T=M.filter(m=>m[0]===ui.sel);
      for(let s=0;s<49;s++){ const q=S.b[s]; if(q==='#')continue; const [x,y]=fgXY(s); disc(g,x,y,6,'#3b2a1e',null);
        if(q==='G'){ disc(g,x+2,y+3,22,'rgba(0,0,0,.35)',null); disc(g,x,y,22,'#f4efe0','#2a1a10'); TG.text(g,'G',x,y+1,{s:18,b:1,c:'#7a6a50',serif:1}); }
        if(q==='F'){ disc(g,x+2,y+3,24,'rgba(0,0,0,.35)',null); disc(g,x,y,24,'#c8641e','#2a1a10'); TG.text(g,'FOX',x,y+1,{s:14,b:1,c:'#fbf6ea'}); }
        if(my&&s===ui.sel)disc(g,x,y,27,'rgba(0,0,0,0)',HL,4); else if(my&&ui.sel==null&&M.some(m=>m[0]===s))disc(g,x,y,26,'rgba(0,0,0,0)','rgba(240,200,60,.7)',3);
        if(s===S.l)disc(g,x,y,4,'#c03030',null); }
      for(const m of T){ const [x,y]=fgXY(m[1]); disc(g,x,y,10,TGT,null); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const h=nearPt(x,y,[62,FGZ],[62,FGZ],7,7,30); if(!h){ ui.sel=null; return null; } const s=h[0]*7+h[1], M=D.foxgeese.moves(S);
      if(ui.sel!=null){ const m=M.find(m=>m[0]===ui.sel&&m[1]===s); if(m){ ui.sel=null; return m; } } ui.sel=M.some(m=>m[0]===s)?s:null; return null; }};

  /* ---------- XIANGQI: Chinese chess on 9x10 points; the generals may not face each other; no move left loses; a move is from+to*90 ---------- */
  const XQV={k:0,a:20,e:20,h:40,r:90,c:45,p:10}, XQC={K:'帥',A:'仕',E:'相',H:'傌',R:'俥',C:'炮',P:'兵',k:'將',a:'士',e:'象',h:'馬',r:'車',c:'砲',p:'卒'};
  const xqGen=(b,col)=>{ const M=[]; for(let s=0;s<90;s++){ const q=b[s]; if(sd(q)!==col)continue; const r=Math.floor(s/9),c=s%9,t=q.toLowerCase(),
      ok=(y,x)=>y>=0&&y<10&&x>=0&&x<9, add=(y,x)=>{ if(!ok(y,x))return 0; const o=sd(b[y*9+x]); if(o===col)return 0; M.push(s+(y*9+x)*90); return o<0; }, pal=(y,x)=>x>=3&&x<=5&&(col?y>=0&&y<=2:y>=7&&y<=9);
    if(t==='k'){ for(const [dr,dc] of RD)if(pal(r+dr,c+dc))add(r+dr,c+dc); }
    else if(t==='a'){ for(const [dr,dc] of BD)if(pal(r+dr,c+dc))add(r+dr,c+dc); }
    else if(t==='e'){ for(const [dr,dc] of BD){ const y=r+2*dr,x=c+2*dc; if(ok(y,x)&&(col?y<=4:y>=5)&&b[(r+dr)*9+c+dc]==='.')add(y,x); } }
    else if(t==='h'){ for(const [dr,dc] of N8)if(ok(r+dr,c+dc)&&b[(Math.abs(dr)===2?r+dr/2:r)*9+(Math.abs(dc)===2?c+dc/2:c)]==='.')add(r+dr,c+dc); }
    else if(t==='r'){ for(const [dr,dc] of RD){ let y=r+dr,x=c+dc; while(add(y,x)){ y+=dr; x+=dc; } } }
    else if(t==='c'){ for(const [dr,dc] of RD){ let y=r+dr,x=c+dc; while(ok(y,x)&&b[y*9+x]==='.'){ M.push(s+(y*9+x)*90); y+=dr; x+=dc; } y+=dr; x+=dc; while(ok(y,x)&&b[y*9+x]==='.'){ y+=dr; x+=dc; } if(ok(y,x)&&sd(b[y*9+x])===1-col)M.push(s+(y*9+x)*90); } }
    else { const f=col?1:-1; add(r+f,c); if(col?r>=5:r<=4){ add(r,c-1); add(r,c+1); } } }
    return M; };
  const xqAtt=(b,s,by)=>{ const r=Math.floor(s/9),c=s%9,U=x=>by?x:x.toUpperCase(), at=(y,x)=>y>=0&&y<10&&x>=0&&x<9?b[y*9+x]:'#';
    for(const [dr,dc] of RD){ let y=r+dr,x=c+dc,q; while((q=at(y,x))==='.'){ y+=dr; x+=dc; } if(q===U('r')||dr&&q===U('k'))return true; if(q==='#')continue; y+=dr; x+=dc; while((q=at(y,x))==='.'){ y+=dr; x+=dc; } if(q===U('c'))return true; }
    for(const [dr,dc] of N8)if(at(r+dr,c+dc)===U('h')&&at(Math.abs(dr)===2?r+dr/2:r+dr,Math.abs(dc)===2?c+dc/2:c+dc)==='.')return true;
    return at(by?r-1:r+1,c)===U('p')||at(r,c-1)===U('p')||at(r,c+1)===U('p'); };
  const xqMv=(b,m)=>{ const f=m%90,t=Math.floor(m/90); return sub(sub(b,t,b[f]),f,'.'); };
  const xqCheck=S=>xqAtt(S.b,S.b.indexOf(S.p?'k':'K'),1-S.p);
  const xqLegal=S=>xqGen(S.b,S.p).filter(m=>{ const b=xqMv(S.b,m); return !xqAtt(b,b.indexOf(S.p?'k':'K'),1-S.p); });
  const xqDo=(S,m)=>({...S,b:xqMv(S.b,m),p:1-S.p,n:S.n+1});
  const xqEnd=S=>!xqLegal(S).length?{win:[1-S.p],text:(S.p?'RED':'BLACK')+' WINS'+(xqCheck(S)?' BY CHECKMATE.':': NO MOVE LEFT.')}:S.n>=300?{win:[],text:'300 MOVES: A DRAW.'}:null;
  const xqEval=(S,p)=>{ let v=0; for(let s=0;s<90;s++){ const q=S.b[s]; if(q==='.')continue; const o=sd(q), t=q.toLowerCase(), r=Math.floor(s/9); let x=XQV[t]; if(t==='p'&&(o?r>=5:r<=4))x+=10-Math.abs(s%9-4); v+=o===p?x:-x; }
    return v+(xqGen(S.b,p).length-xqGen(S.b,1-p).length)*.5; };
  const XZ=52, XY=47, xqAt=(s,fl)=>{ let r=Math.floor(s/9),c=s%9; if(fl){ r=9-r; c=8-c; } return [52+c*XZ,48+r*XY]; };
  D.xiangqi={name:'Xiangqi',kind:'board',min:2,max:2,help:'Chinese chess: Red moves first. Pieces move on the points; the generals stay in their palaces and may never face each other on an open file. Checkmate or leave no move to win.',
    init:()=>({b:'rheakaehr'+'.'.repeat(9)+'.c.....c.'+'p.p.p.p.p'+'.'.repeat(18)+'P.P.P.P.P'+'.C.....C.'+'.'.repeat(9)+'RHEAKAEHR',p:0,n:0,l:-1}),
    moves:S=>xqEnd(S)?[]:xqLegal(S),
    play:(S,m)=>{ const T=xqDo(S,m); T.l=m; return T; },
    over:xqEnd,
    ai:(S,rnd)=>{ const me=S.p, M=xqLegal(S); let best=M[0],bv=-1e18;
      for(const m of M){ const S1=xqDo(S,m), R=xqLegal(S1); let v=1e18; if(!R.length)v=1e7;
        else{ R.sort((a,b)=>(S1.b[Math.floor(b/90)]!=='.')-(S1.b[Math.floor(a/90)]!=='.')); for(const r of R){ const x=xqEval(xqDo(S1,r),me); if(x<v){ v=x; if(v<=bv)break; } } }
        v+=rnd()*2; if(v>bv){ bv=v; best=m; } } return best; },
    status:S=>xqCheck(S)?'CHECK.':'',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const fl=me===1; box(g,22,20,8*XZ+60,9*XY+56,'#e2bf74');
      for(let c=0;c<9;c++){ const x=52+c*XZ; if(c===0||c===8)line(g,x,48,x,48+9*XY,'#3b2a1e',2); else{ line(g,x,48,x,48+4*XY,'#3b2a1e',2); line(g,x,48+5*XY,x,48+9*XY,'#3b2a1e',2); } }
      for(let r=0;r<10;r++)line(g,52,48+r*XY,52+8*XZ,48+r*XY,'#3b2a1e',2);
      for(const y0 of [0,7]){ line(g,52+3*XZ,48+y0*XY,52+5*XZ,48+(y0+2)*XY,'#3b2a1e',1.5); line(g,52+5*XZ,48+y0*XY,52+3*XZ,48+(y0+2)*XY,'#3b2a1e',1.5); }
      TG.text(g,fl?'漢 界        楚 河':'楚 河        漢 界',260,48+4.5*XY,{s:24,c:'#6a4426',serif:1});
      const my=me===S.p&&!xqEnd(S), M=my?xqLegal(S):[], T=M.filter(m=>m%90===ui.sel), ck=xqCheck(S)?S.b.indexOf(S.p?'k':'K'):-1;
      for(let s=0;s<90;s++){ const q=S.b[s]; if(q==='.')continue; const [x,y]=xqAt(s,fl), red=sd(q)===0;
        disc(g,x+2,y+3,21,'rgba(0,0,0,.35)',null); disc(g,x,y,21,'#f4e6c4',s===ck?'#e02020':s===ui.sel&&my?'#e0a020':'#3b2a1e',s===ck||s===ui.sel&&my?4:2); disc(g,x,y,17,'rgba(0,0,0,0)',red?'#b02020':'#1c1c22',1.2);
        TG.text(g,XQC[q],x,y+1,{s:22,b:1,serif:1,c:red?'#b02020':'#1c1c22'}); }
      if(S.l>=0)for(const s of [S.l%90,Math.floor(S.l/90)]){ const [x,y]=xqAt(s,fl); disc(g,x,y,4,'#2a7a40',null); }
      for(const m of T){ const [x,y]=xqAt(Math.floor(m/90),fl); disc(g,x,y,9,TGT,null); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const h=nearPt(x,y,[52,XZ],[48,XY],9,10,24); if(!h){ ui.sel=null; return null; } let [r,c]=h; if(me===1){ r=9-r; c=8-c; } const s=r*9+c, M=D.xiangqi.moves(S);
      if(ui.sel!=null){ const m=M.find(m=>m%90===ui.sel&&Math.floor(m/90)===s); if(m!=null){ ui.sel=null; return m; } } ui.sel=M.some(m=>m%90===s)?s:null; return null; }};

  /* ---------- SHOGI: 9x9 with drops; promote in the far three ranks; a move is from+to*81 (+6561 promoted), a drop 20000+piece*81+to ---------- */
  const SGO=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0]], SSI=[[-1,-1],[-1,0],[-1,1],[1,-1],[1,1]];
  const SHST={K:K8,G:SGO,T:SGO,U:SGO,V:SGO,W:SGO,S:SSI,N:[[-2,-1],[-2,1]],P:[[-1,0]],D:BD,H:RD}, SHRY={L:[[-1,0]],R:RD,D:RD,B:BD,H:BD};
  const PRO={P:'T',L:'U',N:'V',S:'W',R:'D',B:'H'}, UNP={T:'P',U:'L',V:'N',W:'S',D:'R',H:'B'}, SHV={P:1,L:3,N:4,S:5,G:6,B:8,R:10,T:6,U:6,V:6,W:6,H:11,D:13,K:0}, SDR='RBGSNLP';
  const SHK={K:'王',R:'飛',B:'角',G:'金',S:'銀',N:'桂',L:'香',P:'歩',D:'龍',H:'馬',W:'全',V:'圭',U:'杏',T:'と'};
  const shTo=(b,s)=>{ const q=b[s],col=sd(q),U=q.toUpperCase(),r=Math.floor(s/9),c=s%9,f=col?-1:1,T=[];
    for(const [dr,dc] of SHST[U]||[]){ const y=r+dr*f,x=c+dc; if(y>=0&&y<9&&x>=0&&x<9&&sd(b[y*9+x])!==col)T.push(y*9+x); }
    for(const [dr,dc] of SHRY[U]||[]){ let y=r+dr*f,x=c+dc; while(y>=0&&y<9&&x>=0&&x<9){ const o=sd(b[y*9+x]); if(o===col)break; T.push(y*9+x); if(o>=0)break; y+=dr*f; x+=dc; } }
    return T; };
  const shAtt=(b,s,by)=>{ for(let i=0;i<81;i++)if(sd(b[i])===by&&shTo(b,i).includes(s))return true; return false; };
  const shGen=(S,col)=>{ const b=S.b,M=[], zone=y=>col?y>=6:y<=2, last=y=>col?y===8:y===0, last2=y=>col?y>=7:y<=1;
    for(let s=0;s<81;s++){ if(sd(b[s])!==col)continue; const U=b[s].toUpperCase(), r=Math.floor(s/9);
      for(const t of shTo(b,s)){ const y=Math.floor(t/9), can='PLNSRB'.includes(U)&&(zone(r)||zone(y)), must=(U==='P'||U==='L')&&last(y)||U==='N'&&last2(y); if(!must)M.push(s+t*81); if(can)M.push(s+t*81+6561); } }
    for(const L of new Set(S.hd[col])){ const i=SDR.indexOf(L), pf=[]; if(L==='P')for(let k=0;k<81;k++)if(b[k]===(col?'p':'P'))pf[k%9]=1;
      for(let t=0;t<81;t++){ if(b[t]!=='.')continue; const y=Math.floor(t/9); if((L==='P'||L==='L')&&last(y)||L==='N'&&last2(y)||L==='P'&&pf[t%9])continue; M.push(20000+i*81+t); } }
    return M; };
  const shFT=m=>m>=20000?['d'+SDR[Math.floor((m-20000)/81)],(m-20000)%81]:[m%6561%81,Math.floor(m%6561/81)];
  const shDo=(S,m)=>{ const col=S.p, b=[...S.b], hd=[...S.hd];
    if(m>=20000){ const L=SDR[Math.floor((m-20000)/81)], t=(m-20000)%81; b[t]=col?L.toLowerCase():L; hd[col]=hd[col].replace(L,''); }
    else{ const [f,t]=shFT(m); if(b[t]!=='.'){ const U=b[t].toUpperCase(); hd[col]=[...hd[col]+(UNP[U]||U)].sort().join(''); } let q=b[f]; if(m>=6561){ q=PRO[q.toUpperCase()]; if(col)q=q.toLowerCase(); } b[t]=q; b[f]='.'; }
    return {...S,b:b.join(''),hd,p:1-col,n:S.n+1}; };
  const shCheck=S=>shAtt(S.b,S.b.indexOf(S.p?'k':'K'),1-S.p);
  const shLegal=S=>{ const col=S.p, chk=shCheck(S); return shGen(S,col).filter(m=>{ if(m>=20000&&!chk)return true; const T=shDo(S,m); return !shAtt(T.b,T.b.indexOf(col?'k':'K'),1-col); }); };
  const shEnd=S=>!shLegal(S).length?{win:[1-S.p],text:(S.p?'BLACK':'WHITE')+' WINS BY CHECKMATE.'}:S.n>=300?{win:[],text:'300 MOVES: A DRAW.'}:null;
  const shEval=(S,p)=>{ let v=0; for(let s=0;s<81;s++){ const q=S.b[s]; if(q!=='.')v+=sd(q)===p?SHV[q.toUpperCase()]:-SHV[q.toUpperCase()]; } for(const L of S.hd[p])v+=SHV[L]*1.1; for(const L of S.hd[1-p])v-=SHV[L]*1.1; return v; };
  const shPent=(g,x,y,z,up,q,sel)=>{ g.save(); g.translate(x,y); if(!up)g.rotate(Math.PI); const w=z*.8,h=z*.9; g.beginPath(); g.moveTo(0,-h/2); g.lineTo(w*.4,-h*.3); g.lineTo(w/2,h/2); g.lineTo(-w/2,h/2); g.lineTo(-w*.4,-h*.3); g.closePath();
    g.fillStyle='rgba(0,0,0,.3)'; g.fill(); g.translate(-1,-2); g.fillStyle='#f0d9a0'; g.fill(); g.strokeStyle=sel?'#e0a020':'#3b2a1e'; g.lineWidth=sel?3:1.5; g.stroke(); g.restore();
    const U=q.toUpperCase(); g.save(); g.translate(x-1,y); if(!up)g.rotate(Math.PI); TG.text(g,U==='K'&&!up?'玉':SHK[U],0,2,{s:Math.round(z*.48),b:1,serif:1,c:UNP[U]?'#b02020':'#1c1c22'}); g.restore(); };
  const shHand=(S,col)=>SDR.split('').filter(L=>S.hd[col].includes(L)).map((L,i)=>[L,[...S.hd[col]].filter(x=>x===L).length,12+i*52]);
  D.shogi={name:'Shogi',kind:'board',min:2,max:2,help:'Japanese chess: Black moves first. Captured pieces join your hand and may be dropped back on an empty square as your move. Pieces promote in the far three ranks. Checkmate the king to win.',
    init:()=>({b:'lnsgkgsnl.r.....b.ppppppppp'+'.'.repeat(27)+'PPPPPPPPP.B.....R.LNSGKGSNL',hd:['',''],p:0,n:0,l:-1}),
    moves:S=>shEnd(S)?[]:shLegal(S),
    play:(S,m)=>{ const T=shDo(S,m); T.l=shFT(m)[1]; return T; },
    over:shEnd,
    ai:(S,rnd)=>{ const me=S.p, M=shLegal(S); let best=M[0],bv=-1e18;
      for(const m of M){ const T=shDo(S,m); let v=shEval(T,me);
        if(shAtt(T.b,T.b.indexOf(me?'K':'k'),me)){ if(!shLegal(T).length)v+=1e6; else v+=.3; }
        let worst=0; for(let s=0;s<81;s++)if(sd(T.b[s])===1-me)for(const t of shTo(T.b,s))if(sd(T.b[t])===me){ const U=T.b[t].toUpperCase(); let x=SHV[U]+SHV[UNP[U]||U]*1.1;
          if(x>worst){ const b2=sub(sub(T.b,t,T.b[s]),s,'.'); if(shAtt(b2,t,me)){ const A=T.b[s].toUpperCase(); x-=SHV[A]+SHV[UNP[A]||A]*1.1; } if(x>worst)worst=x; } }
        v-=worst*.9; v+=rnd()*.3; if(v>bv){ bv=v; best=m; } } return best; },
    status:S=>shCheck(S)?'CHECK.':'',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H); const z=44,ox=62,oy=62,fl=me===1, at=s=>{ let r=Math.floor(s/9),c=s%9; if(fl){ r=8-r; c=8-c; } return [ox+c*z,oy+r*z]; };
      box(g,ox-8,oy-8,9*z+16,9*z+16,'#e2bf74'); for(let i=0;i<=9;i++){ line(g,ox+i*z,oy,ox+i*z,oy+9*z,'#3b2a1e',1.5); line(g,ox,oy+i*z,ox+9*z,oy+i*z,'#3b2a1e',1.5); }
      for(const [i,j] of [[3,3],[3,6],[6,3],[6,6]])disc(g,ox+i*z,oy+j*z,3,'#3b2a1e',null);
      const my=me===S.p&&!shEnd(S), M=my?shLegal(S):[], T=ui.sel!=null?M.filter(m=>shFT(m)[0]===ui.sel):[], ck=shCheck(S)?S.b.indexOf(S.p?'k':'K'):-1, bot=fl?1:0;
      for(let s=0;s<81;s++){ const [x,y]=at(s); if(s===S.l)box(g,x+1,y+1,z-2,z-2,'rgba(220,170,60,.45)'); if(s===ck)box(g,x+1,y+1,z-2,z-2,'rgba(200,40,40,.55)');
        const q=S.b[s]; if(q!=='.')shPent(g,x+z/2,y+z/2,z,sd(q)===bot,q,my&&s===ui.sel); }
      for(const col of [0,1]){ const y=col===bot?489:31; box(g,6,y-24,400,48,'rgba(0,0,0,.25)'); TG.text(g,col?'WHITE':'BLACK',440,y,{s:12,b:1});
        for(const [L,n,x] of shHand(S,col)){ shPent(g,x+22,y,40,col===bot,col?L.toLowerCase():L,my&&ui.sel==='d'+L&&col===S.p); if(n>1)TG.text(g,'×'+n,x+42,y+14,{s:12,b:1,c:'#fbf6ea'}); } }
      for(const m of T){ const [x,y]=at(shFT(m)[1]); disc(g,x+z/2,y+z/2,8,TGT,null); }
      const tt=new Set(T.map(m=>shFT(m)[1])); if([...tt].some(t=>T.some(m=>m<6561&&shFT(m)[1]===t)&&T.some(m=>m>=6561&&m<20000&&shFT(m)[1]===t)))TG.btn(g,ui,'np',406,4,110,26,ui.np?'PROMOTE: NO':'PROMOTE: YES'); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; if(TG.hit(ui,x,y)==='np'){ ui.np=!ui.np; return null; } const M=D.shogi.moves(S), mine=me;
      if(y>=465){ const e=shHand(S,mine).find(([L,n,hx])=>x>=hx&&x<hx+48); ui.sel=e&&M.some(m=>shFT(m)[0]==='d'+e[0])?'d'+e[0]:null; return null; }
      let c=Math.floor((x-62)/44), r=Math.floor((y-62)/44); if(c<0||c>8||r<0||r>8){ ui.sel=null; return null; } if(me===1){ r=8-r; c=8-c; } const s=r*9+c;
      if(ui.sel!=null){ const f=M.filter(m=>{ const [a,t]=shFT(m); return a===ui.sel&&t===s; }); if(f.length){ const pm=f.find(m=>m>=6561&&m<20000), np=f.find(m=>m<6561||m>=20000); ui.sel=null; return ui.np?(np??pm):(pm??np); } }
      ui.sel=M.some(m=>m<20000&&shFT(m)[0]===s)?s:null; return null; }};
  return D; });
