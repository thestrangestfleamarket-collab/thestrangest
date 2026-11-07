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
  return D; });
