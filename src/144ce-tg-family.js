// THE CAFÉ'S FAMILY GAMES (TG, 144cc): backgammon, mills, mancala, sea battle, the hopping races, ludo, snakes and ladders, dominoes, dots and boxes and the dice games, each its rules, the computer's play and its board.
import {TG} from './144cc-tables.js';
TG.lib.push(()=>{ '@tables'; const D={};
  const COL=['#c0242c','#2a6ad0','#e0b020','#2a9a4a'], CN=['RED','BLUE','YELLOW','GREEN'];
  const d6=rnd=>1+Math.floor(rnd()*6), setc=(s,i,c)=>s.slice(0,i)+c+s.slice(i+1), has=(M,m)=>M.some(q=>TG.eq(q,m)), sum=a=>a.reduce((x,y)=>x+y,0);
  const wood=(g,W,H,a='#7a5230')=>{ g.fillStyle=a; g.fillRect(0,0,W,H); for(let y=0;y<H;y+=5){ g.fillStyle=`rgba(40,20,8,${(.06+.05*Math.sin(y*.21)+.04*Math.sin(y*.047)).toFixed(3)})`; g.fillRect(0,y,W,3); } };
  const disc=(g,x,y,r,f,s='#1c1c22',lw=2)=>{ g.beginPath(); g.arc(x,y,r,0,7); g.fillStyle=f; g.fill(); if(s){ g.strokeStyle=s; g.lineWidth=lw; g.stroke(); } };
  const ring=(g,x,y,r,c='#ffd040',lw=3)=>{ g.beginPath(); g.arc(x,y,r,0,7); g.strokeStyle=c; g.lineWidth=lw; g.stroke(); };
  const near=(P,x,y,r)=>{ let b=-1, bd=r*r; P.forEach(([px,py],i)=>{ const d=(px-x)**2+(py-y)**2; if(d<bd){ bd=d; b=i; } }); return b; };
  // seats round a table from the viewer's: bottom, left, top, right (two players face each other)
  const seatAt=(i,me,n)=>{ const k=(i-Math.max(me,0)+n)%n; return n===2?[0,2][k]:k; };
  const best=(M,f)=>{ let b=M[0], bv=-1e18; for(const m of M){ const v=f(m); if(v>bv){ bv=v; b=m; } } return b; };
  const pname=(i,me)=>i===me?'YOU':'PLAYER '+(i+1);

  /* ---------- BACKGAMMON: race fifteen checkers round and bear them off; a lone checker hit goes to the bar ---------- */
  const BGN=['WHITE','BLACK'];
  const bgOwn=(v,p)=>p?v<0:v>0, bgTo=(f,d,p)=>f===24?(p?d-1:24-d):f+(p?d:-d), bgDst=(m,p)=>{ const t=bgTo(m[0],m[1],p); return t<0||t>23?'off':t; };
  const bgCl=S=>({b:S.b.slice(),bar:S.bar.slice(),off:S.off.slice(),d:S.d.slice(),p:S.p});
  const bgRaw=S=>{ const p=S.p, b=S.b, out=[], fr=S.bar[p]?[24]:[...Array(24).keys()].filter(i=>bgOwn(b[i],p));
    let home=!S.bar[p]; if(home)for(let i=0;i<24;i++)if(bgOwn(b[i],p)&&(p?i<18:i>5)){ home=false; break; }
    for(const d of [...new Set(S.d)])for(const f of fr){ const t=bgTo(f,d,p);
      if(t>=0&&t<24){ if(!(bgOwn(b[t],1-p)&&Math.abs(b[t])>1))out.push([f,d]); continue; }
      if(!home)continue; if(t===-1||t===24){ out.push([f,d]); continue; }
      let hi=false; if(p){ for(let i=18;i<f;i++)if(bgOwn(b[i],p))hi=true; } else for(let i=f+1;i<6;i++)if(bgOwn(b[i],p))hi=true; if(!hi)out.push([f,d]); }
    return out; };
  const bgApply=(S,[f,d])=>{ const p=S.p, s=p?-1:1, t=bgTo(f,d,p); if(f===24)S.bar[p]--; else S.b[f]-=s;
    if(t>=0&&t<24){ if(bgOwn(S.b[t],1-p)){ S.b[t]=0; S.bar[1-p]++; } S.b[t]+=s; } else S.off[p]++; S.d.splice(S.d.indexOf(d),1); return S; };
  const bgMax=S=>{ if(!S.d.length||S.off[S.p]===15)return 0; let b=0; for(const m of bgRaw(S)){ b=Math.max(b,1+bgMax(bgApply(bgCl(S),m))); if(b===S.d.length)break; } return b; };
  // you must use as many dice as you can, and the larger one if only one can be used
  const bgMoves=S=>{ if(bgOver(S))return []; const R=bgRaw(S); if(!R.length)return ['PASS']; const U=R.map(m=>1+bgMax(bgApply(bgCl(S),m))), top=Math.max(...U); let M=R.filter((m,i)=>U[i]===top);
    if(top===1&&S.d.length===2&&S.d[0]!==S.d[1]){ const hi=Math.max(...S.d); if(M.some(m=>m[1]===hi))M=M.filter(m=>m[1]===hi); } return M; };
  const bgNext=S=>{ S.p=1-S.p; const rnd=TG.rng(S), a=d6(rnd), b=d6(rnd); S.d=a===b?[a,a,a,a]:[a,b]; };
  const bgPip=(S,p)=>{ let s=S.bar[p]*25; for(let i=0;i<24;i++)if(bgOwn(S.b[i],p))s+=Math.abs(S.b[i])*(p?24-i:i+1); return s; };
  const bgOver=S=>{ for(const p of [0,1])if(S.off[p]===15)return {win:[p],text:BGN[p]+' BEARS OFF ALL FIFTEEN AND WINS.'};
    if(S.n>=1200){ const a=bgPip(S,0), b=bgPip(S,1); return {win:a===b?[]:[a<b?0:1],text:a===b?'A DRAW.':BGN[a<b?0:1]+' WINS THE RACE.'}; } return null; };
  const bgX=i=>{ const c=i<12?11-i:i-12; return (c<6?14+c*34:254+(c-6)*34)+17; };
  const bgAt=(x,y)=>{ if(x>=462)return 'off'; if(x>=218&&x<254)return 24; let c; if(x>=14&&x<218)c=Math.floor((x-14)/34); else if(x>=254&&x<458)c=6+Math.floor((x-254)/34); else return null; return y<260?12+c:11-c; };
  const bgChk=(g,x,y,p)=>{ disc(g,x,y,15,p?'#26262c':'#ece4d0',p?'#c8b088':'#3b2a1e',2); ring(g,x,y,9,p?'#44444c':'#c8bca0',2); };
  D.backgammon={name:'Backgammon',kind:'board',min:2,max:2,help:'Roll and move your checkers round the board by the dice, hitting lone enemy checkers to the bar; bring all fifteen home, then bear them off. Doubles move four times.',
    init:(n,rnd)=>{ const b=Array(24).fill(0); b[23]=2; b[12]=5; b[7]=3; b[5]=5; b[0]=-2; b[11]=-5; b[16]=-3; b[18]=-5; let a, c; do{ a=d6(rnd); c=d6(rnd); }while(a===c); return {b,bar:[0,0],off:[0,0],d:[a,c],p:a>c?0:1,n:0}; },
    moves:bgMoves,
    play:(S,m)=>{ S.n++; if(m==='PASS'){ bgNext(S); return S; } bgApply(S,m); if(S.off[S.p]===15)return S; if(!S.d.length||!bgRaw(S).length)bgNext(S); return S; },
    over:bgOver,
    score:(S,p)=>{ if(S.off[p]===15)return 1e4; let v=bgPip(S,1-p)-bgPip(S,p)+S.bar[1-p]*4; const s=p?-1:1;
      for(let i=0;i<24;i++){ const c=S.b[i]*s; if(c>=2)v+=(p?i>=18:i<=5)?3:1.5; else if(c===1){ let ex=S.bar[1-p]>0&&(p?i>=12:i<12); for(let j=0;j<24&&!ex;j++)if(bgOwn(S.b[j],1-p)&&(p?j>i&&j-i<=12:j<i&&i-j<=12))ex=true; v-=ex?5:1; } } return v; },
    status:S=>{ if(bgOver(S))return ''; return BGN[S.p]+' · DICE '+S.d.join(' ')+(bgRaw(S).length?'':' · NO MOVE: PASS.')+' · PIPS '+bgPip(S,0)+'/'+bgPip(S,1); },
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#5a3a20'); g.fillStyle='#2f5a3a'; g.fillRect(14,14,204,492); g.fillRect(254,14,204,492); g.fillStyle='#3e2614'; g.fillRect(218,14,36,492); g.fillRect(462,14,50,492);
      const M=me===S.p?bgMoves(S):[], my=M[0]==='PASS'?[]:M, src=new Set(my.map(m=>m[0])), sel=S.bar[S.p]&&me===S.p?24:ui.sel, tg=new Set(my.filter(m=>m[0]===sel).map(m=>bgDst(m,S.p)));
      for(let i=0;i<24;i++){ const x=bgX(i), top=i>=12, by=top?14:506; g.beginPath(); g.moveTo(x-17,by); g.lineTo(x+17,by); g.lineTo(x,top?200:320); g.closePath(); g.fillStyle=tg.has(i)?'#f0c040':i%2?'#c8b088':'#8a2a24'; g.fill();
        const c=Math.abs(S.b[i]), col=S.b[i]>0?0:1, yk=k=>top?31+k*31:489-k*31; for(let k=0;k<Math.min(c,5);k++)bgChk(g,x,yk(k),col);
        if(c>5)TG.text(g,''+c,x,yk(4),{b:1,s:14,c:col?'#f1e6c8':'#1c1c22'}); if(src.has(i)&&c)ring(g,x,yk(Math.min(c,5)-1),17,sel===i?'#ff8020':'#ffd040'); }
      for(const p of [0,1]){ const c=S.bar[p]; for(let k=0;k<Math.min(c,4);k++)bgChk(g,236,p?300+k*30:220-k*30,p); if(c>1)TG.text(g,''+c,236,p?300:220,{b:1,c:p?'#f1e6c8':'#1c1c22'}); if(c&&src.has(24)&&S.p===p)ring(g,236,p?300:220,17,'#ff8020'); }
      for(const p of [0,1])for(let k=0;k<S.off[p];k++){ g.fillStyle=p?'#26262c':'#ece4d0'; g.fillRect(467,p?20+k*12:494-k*12,40,9); g.strokeStyle='#1c1c22'; g.lineWidth=1; g.strokeRect(467,p?20+k*12:494-k*12,40,9); }
      if(tg.has('off')){ g.strokeStyle='#ffd040'; g.lineWidth=4; g.strokeRect(464,S.p?16:262,46,242); }
      if(!bgOver(S)){ const x0=S.p?40:280; S.d.forEach((v,k)=>TG.die(g,x0+k*42,243,v,34)); TG.text(g,BGN[S.p],S.p?190:430,260,{b:1,s:12,c:'#f1e6c8'}); }
      if(M[0]==='PASS')TG.btn(g,ui,'pass',S.p?280:40,240,120,40,'PASS'); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const M=bgMoves(S); if(!M.length)return null; if(M[0]==='PASS')return TG.hit(ui,x,y)==='pass'?'PASS':null;
      const at=bgAt(x,y); if(at==null)return null; if(S.bar[S.p])ui.sel=24;
      if(ui.sel!=null){ const h=M.filter(m=>m[0]===ui.sel&&bgDst(m,S.p)===at).sort((a,b)=>a[1]-b[1]); if(h.length)return h[0]; }
      ui.sel=M.some(m=>m[0]===at)?at:S.bar[S.p]?24:null; return null; }};

  /* ---------- NINE MEN'S MORRIS: place nine, then slide (or fly at three); a mill of three takes an enemy piece ---------- */
  const NMQ=[[0,0],[3,0],[6,0],[6,3],[6,6],[3,6],[0,6],[0,3]], nmXY=i=>{ const k=Math.floor(i/8), [x,y]=NMQ[i%8]; return [50+70*(k+x*(3-k)/3),50+70*(k+y*(3-k)/3)]; };
  const NMA=[...Array(24)].map((_,i)=>{ const k=Math.floor(i/8), j=i%8, a=[k*8+(j+1)%8,k*8+(j+7)%8]; if(j%2){ if(k)a.push(i-8); if(k<2)a.push(i+8); } return a; });
  const NMM=[]; for(let k=0;k<3;k++)for(const j of [0,2,4,6])NMM.push([k*8+j,k*8+j+1,k*8+(j+2)%8]); for(const j of [1,3,5,7])NMM.push([j,j+8,j+16]);
  const nmMill=(b,i)=>b[i]!=='.'&&NMM.some(m=>m.includes(i)&&m.every(x=>b[x]===b[i]));
  const nmCnt=(S,p)=>[...S.b].filter(v=>v===''+p).length+S.h[p];
  const nmRaw=S=>{ const c=''+S.p, o=''+(1-S.p), B=[...S.b], E=B.map((v,i)=>v==='.'?i:-1).filter(i=>i>=0);
    if(S.rm){ const op=B.map((v,i)=>v===o?i:-1).filter(i=>i>=0), fr=op.filter(i=>!nmMill(S.b,i)); return (fr.length?fr:op).map(i=>'x'+i); }
    if(S.h[S.p])return E; const mine=B.map((v,i)=>v===c?i:-1).filter(i=>i>=0), fly=mine.length===3, out=[];
    for(const a of mine)for(const t of fly?E:NMA[a])if(S.b[t]==='.')out.push([a,t]); return out; };
  const nmOver=S=>{ for(const p of [0,1])if(nmCnt(S,p)<3)return {win:[1-p],text:(p?'WHITE':'BLACK')+' WINS: THE OTHER HAS TWO PIECES LEFT.'};
    if(!nmRaw(S).length)return {win:[1-S.p],text:(S.p?'WHITE':'BLACK')+' WINS: THE OTHER CANNOT MOVE.'}; if(S.n>=200)return {win:[],text:'A DRAW AFTER 200 MOVES.'}; return null; };
  D.ninemens={name:"Nine Men's Morris",kind:'board',min:2,max:2,help:'Place your nine pieces in turn, then slide them along the lines; with three left you may fly anywhere. Three in a row (a mill) takes an enemy piece. Two pieces left, or no move, loses.',
    init:()=>({b:'.'.repeat(24),p:0,h:[9,9],rm:0,n:0}),
    moves:S=>nmOver(S)?[]:nmRaw(S),
    play:(S,m)=>{ S.n++; const c=''+S.p; let to;
      if(typeof m==='string'){ S.b=setc(S.b,+m.slice(1),'.'); S.rm=0; S.p=1-S.p; return S; }
      if(typeof m==='number'){ S.b=setc(S.b,m,c); S.h[S.p]--; to=m; } else { S.b=setc(setc(S.b,m[0],'.'),m[1],c); to=m[1]; }
      if(nmMill(S.b,to)&&S.b.includes(''+(1-S.p)))S.rm=1; else S.p=1-S.p; return S; },
    over:nmOver,
    score:(S,p)=>{ const o=nmOver(S); if(o)return o.win.includes(p)?1e4:o.win.length?-1e4:0; const c=''+p, q=''+(1-p); let v=(nmCnt(S,p)-nmCnt(S,1-p))*20+(S.rm&&S.p===p?18:0);
      for(const m of NMM){ const k=m.filter(i=>S.b[i]===c).length, e=m.filter(i=>S.b[i]==='.').length, k2=m.filter(i=>S.b[i]===q).length; if(k===2&&e===1)v+=4; if(k2===2&&e===1)v-=S.p!==p?9:4; }
      return v+(S.h[p]?0:NMA.reduce((a,n,i)=>a+(S.b[i]===c?n.filter(t=>S.b[t]==='.').length*.3:0),0)); },
    status:S=>S.rm?'A MILL! TAKE A PIECE.':S.h[S.p]?'PLACE A PIECE ('+S.h[S.p]+' LEFT).':nmCnt(S,S.p)===3?'FLY A PIECE ANYWHERE.':'SLIDE A PIECE.',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#b08850'); g.strokeStyle='#3b2a1e'; g.lineWidth=5;
      for(let k=0;k<3;k++){ const [a]=nmXY(k*8), [b]=nmXY(k*8+4); g.strokeRect(a,a,b-a,b-a); }
      for(const j of [1,3,5,7]){ const [x1,y1]=nmXY(j), [x2,y2]=nmXY(j+16); g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); }
      const M=me===S.p?D.ninemens.moves(S):[], tg=new Set(), src=new Set(), rm=new Set();
      for(const m of M){ if(typeof m==='number')tg.add(m); else if(typeof m==='string')rm.add(+m.slice(1)); else { src.add(m[0]); if(m[0]===ui.sel)tg.add(m[1]); } }
      for(let i=0;i<24;i++){ const [x,y]=nmXY(i), v=S.b[i]; disc(g,x,y,7,'#3b2a1e',null); if(tg.has(i))ring(g,x,y,14,'#ffd040',4);
        if(v!=='.'){ disc(g,x,y,22,v==='0'?'#ece4d0':'#26262c',v==='0'?'#3b2a1e':'#c8b088',3); ring(g,x,y,13,v==='0'?'#c8bca0':'#44444c',2); if(rm.has(i))ring(g,x,y,26,'#e03020',4); else if(src.has(i))ring(g,x,y,26,i===ui.sel?'#ff8020':'#ffd040',3); } }
      for(const p of [0,1])for(let k=0;k<S.h[p];k++)disc(g,p?506:14,40+k*24,9,p?'#26262c':'#ece4d0',p?'#c8b088':'#3b2a1e',2); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const M=D.ninemens.moves(S), i=near(NMA.map((_,k)=>nmXY(k)),x,y,32); if(i<0)return null;
      if(has(M,'x'+i))return 'x'+i; if(has(M,i))return i; if(ui.sel!=null&&has(M,[ui.sel,i]))return [ui.sel,i]; ui.sel=M.some(m=>Array.isArray(m)&&m[0]===i)?i:null; return null; }};

  /* ---------- MANCALA (KALAH): sow seeds round the pits; end in your store to go again, in your empty pit to capture ---------- */
  const kaMoves=S=>{ const o=S.p?7:0, b=S.b; if(b.slice(0,6).every(x=>!x)||b.slice(7,13).every(x=>!x))return []; return [0,1,2,3,4,5].map(k=>k+o).filter(i=>b[i]>0); };
  const kaSow=(S,i)=>{ const p=S.p, b=S.b, st=p?13:6; let n=b[i], j=i; b[i]=0; while(n){ j=(j+1)%14; if(j===(p?6:13))continue; b[j]++; n--; }
    if((p?j>=7&&j<=12:j<=5)&&b[j]===1&&b[12-j]>0){ b[st]+=b[12-j]+1; b[12-j]=0; b[j]=0; } if(j!==st)S.p=1-p;
    if(b.slice(0,6).every(x=>!x)||b.slice(7,13).every(x=>!x))for(let k=0;k<6;k++){ b[6]+=b[k]; b[k]=0; b[13]+=b[7+k]; b[7+k]=0; } return S; };
  const kaMM=(S,me,d,a,z)=>{ const M=kaMoves(S); if(!d||!M.length)return S.b[me?13:6]-S.b[me?6:13];
    let v=S.p===me?-1e9:1e9; for(const m of M){ const r=kaMM(kaSow({b:S.b.slice(),p:S.p},m),me,d-1,a,z); if(S.p===me){ v=Math.max(v,r); a=Math.max(a,v); } else { v=Math.min(v,r); z=Math.min(z,v); } if(a>=z)break; } return v; };
  const kaXY=(i,me)=>{ const v=me===1?1:0, mine=v?i>=7&&i<=12:i<=5; if(i===(v?13:6))return [470,260,1]; if(i===(v?6:13))return [50,260,1]; const k=v?(i+7)%14:i; return mine?[118+k*57,320]:[118+(12-k)*57,200]; };
  D.mancala={name:'Mancala',kind:'board',min:2,max:2,help:'Pick up a pit of yours and sow its seeds one by one to the right. Ending in your store plays again; ending in an empty pit of yours takes the seeds across. Most seeds in store wins.',
    init:()=>({b:[4,4,4,4,4,4,0,4,4,4,4,4,4,0],p:0}),
    moves:kaMoves, play:(S,m)=>kaSow(S,m),
    over:S=>{ if(kaMoves(S).length)return null; const a=S.b[6], c=S.b[13]; return {win:a===c?[]:[a>c?0:1],text:a===c?'A DRAW, '+a+' EACH.':(a>c?'SOUTH':'NORTH')+' WINS, '+Math.max(a,c)+' TO '+Math.min(a,c)+'.'}; },
    ai:(S,rnd)=>best(kaMoves(S),m=>kaMM(kaSow({b:S.b.slice(),p:S.p},m),S.p,6,-1e9,1e9)+rnd()*.1),
    status:(S,me)=>'STORES '+S.b[me===1?13:6]+' (YOURS) TO '+S.b[me===1?6:13]+'.',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#3a2416'); g.fillStyle='#8a5a30'; g.fillRect(14,140,492,240); g.strokeStyle='#4a2e18'; g.lineWidth=4; g.strokeRect(14,140,492,240);
      const M=me===S.p?kaMoves(S):[];
      for(let i=0;i<14;i++){ const [x,y,st]=kaXY(i,me); g.fillStyle='#5a3418'; if(st){ g.fillRect(x-26,170,52,180); } else disc(g,x,y,25,'#5a3418','#3b2410',2);
        if(M.includes(i))ring(g,x,y,28,'#ffd040',4); const n=S.b[i];
        for(let k=0;k<Math.min(n,st?30:14);k++){ const a=k*2.4, rr=st?4+k*2.2:3+k*1.25; disc(g,x+Math.cos(a)*Math.min(rr,st?18:16),y+Math.sin(a)*Math.min(rr,st?70:16)*(st?1:1),4,['#e8d6a8','#c06040','#6aa0c0','#90b060'][k%4],'#2a1a10',1); }
        TG.text(g,''+n,x,st?y+110:(y<260?y-40:y+40),{b:1,s:16}); }
      TG.text(g,me===1||me===0?'YOUR STORE →':'',440,120,{s:12}); },
    click:(S,me,x,y)=>{ if(me!==S.p)return null; for(const i of kaMoves(S)){ const [px,py]=kaXY(i,me); if((px-x)**2+(py-y)**2<30*30)return i; } return null; }};

  /* ---------- SEA BATTLE: hide a fleet of five on a 10x10 sea, then take turns firing; sink every ship to win ---------- */
  const FLEET=[5,4,3,3,2], SBN=['CARRIER','BATTLESHIP','CRUISER','SUBMARINE','DESTROYER'];
  const sbFits=(sb,len,x,y,hz)=>{ for(let t=0;t<len;t++){ const cx=x+(hz?t:0), cy=y+(hz?0:t); if(cx>9||cy>9||sb[cy*10+cx]!=='.')return false; } return true; };
  const sbPut=(sb,k,x,y,hz)=>{ for(let t=0;t<FLEET[k];t++)sb=setc(sb,(y+(hz?0:t))*10+x+(hz?t:0),'abcde'[k]); return sb; };
  const sbSunk=(S,o,c)=>![...S.s[o]].some((v,i)=>v===c&&S.h[o][i]!=='x');
  const sbLeft=(S,o)=>[...S.s[o]].some((v,i)=>v!=='.'&&S.h[o][i]!=='x');
  const sbOver=S=>{ if(!S.ph)return null; for(const o of [0,1])if(!sbLeft(S,o))return {win:[1-o],text:'PLAYER '+(2-o)+' SINKS THE WHOLE FLEET AND WINS.'}; return null; };
  const sbGX=[24,276], sbGY=150, sbC=22, sbCell=(gx,x,y)=>{ const cx=Math.floor((x-sbGX[gx])/sbC), cy=Math.floor((y-sbGY)/sbC); return cx>=0&&cx<10&&cy>=0&&cy<10?[cx,cy]:null; };
  D.seabattle={name:'Sea Battle',kind:'board',min:2,max:2,help:'Each admiral hides five ships (5, 4, 3, 3 and 2 long) on their own sea, then you take turns firing at a square of the other sea. Sink all five to win.',
    init:()=>({s:['.'.repeat(100),'.'.repeat(100)],h:['.'.repeat(100),'.'.repeat(100)],k:[0,0],p:0,ph:0,m:''}),
    moves:S=>{ if(sbOver(S))return []; if(!S.ph){ const k=S.k[S.p], out=['RANDOM']; for(let hz=0;hz<2;hz++)for(let i=0;i<100;i++)if(sbFits(S.s[S.p],FLEET[k],i%10,Math.floor(i/10),hz))out.push(hz*100+i); return out; }
      const h=S.h[1-S.p], out=[]; for(let i=0;i<100;i++)if(h[i]==='.')out.push(i); return out; },
    play:(S,m)=>{ const p=S.p;
      if(!S.ph){ if(m==='RANDOM'){ const rnd=TG.rng(S); while(S.k[p]<5){ const hz=rnd()<.5, x=Math.floor(rnd()*10), y=Math.floor(rnd()*10); if(sbFits(S.s[p],FLEET[S.k[p]],x,y,hz)){ S.s[p]=sbPut(S.s[p],S.k[p],x,y,hz); S.k[p]++; } } }
        else { const hz=m>=100, i=m%100; S.s[p]=sbPut(S.s[p],S.k[p],i%10,Math.floor(i/10),hz); S.k[p]++; }
        if(S.k[p]===5){ if(p===0)S.p=1; else { S.ph=1; S.p=0; S.m='FIRE AWAY!'; } } return S; }
      const o=1-p, c=S.s[o][m]; S.h[o]=setc(S.h[o],m,c==='.'?'o':'x'); S.m=c==='.'?'MISS.':sbSunk(S,o,c)?'SUNK THE '+SBN['abcde'.indexOf(c)]+'!':'HIT!'; S.p=o; return S; },
    over:sbOver,
    ai:(S,rnd)=>{ if(!S.ph)return 'RANDOM'; const o=1-S.p, sh=S.h[o], sb=S.s[o], live=[], cand=[];
      for(let i=0;i<100;i++)if(sh[i]==='x'&&!sbSunk(S,o,sb[i]))live.push(i);
      for(const i of live){ const x=i%10, y=Math.floor(i/10); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||nx>9||ny<0||ny>9||sh[ny*10+nx]!=='.')continue;
        const bx=x-dx, by=y-dy; cand.push([ny*10+nx,(bx>=0&&bx<=9&&by>=0&&by<=9&&live.includes(by*10+bx)?5:1)+rnd()]); } }
      if(cand.length)return cand.sort((a,b)=>b[1]-a[1])[0][0];
      const F=[...Array(100).keys()].filter(i=>sh[i]==='.'), P=F.filter(i=>(i%10+Math.floor(i/10))%2===0), A=P.length?P:F; return A[Math.floor(rnd()*A.length)]; },
    status:(S,me)=>!S.ph?(me===S.p?'PLACE YOUR '+SBN[S.k[S.p]]+' ('+FLEET[S.k[S.p]]+') OR PRESS RANDOM FLEET.':'THE ADMIRALS HIDE THEIR FLEETS.'):S.m,
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#4a3220'); const own=me>=0?me:0, opp=me>=0?1-me:1;
      const grid=(gx,o,ships,label)=>{ const X=sbGX[gx]; g.fillStyle='#1f4a6a'; g.fillRect(X,sbGY,220,220); TG.text(g,label,X+110,sbGY-34,{b:1,serif:1,s:14});
        for(let i=0;i<10;i++){ TG.text(g,'ABCDEFGHIJ'[i],X+i*sbC+11,sbGY-12,{s:10,c:'#c9b890'}); TG.text(g,''+(i+1),X-(gx?-232:9),sbGY+i*sbC+11,{s:9,c:'#c9b890'}); }
        g.strokeStyle='rgba(200,230,255,.25)'; g.lineWidth=1; for(let i=0;i<=10;i++){ g.beginPath(); g.moveTo(X+i*sbC,sbGY); g.lineTo(X+i*sbC,sbGY+220); g.moveTo(X,sbGY+i*sbC); g.lineTo(X+220,sbGY+i*sbC); g.stroke(); }
        for(let i=0;i<100;i++){ const x=X+(i%10)*sbC, y=sbGY+Math.floor(i/10)*sbC, c=S.s[o][i], h=S.h[o][i], sunk=c!=='.'&&S.ph&&sbSunk(S,o,c);
          if(c!=='.'&&(ships||sunk)){ g.fillStyle=sunk?'#3a2a2a':'#8a929a'; g.fillRect(x+2,y+2,sbC-4,sbC-4); }
          if(h==='x')disc(g,x+11,y+11,7,'#e03020','#5a1010',2); else if(h==='o')disc(g,x+11,y+11,3,'#e8eef4',null); } };
      if(me<0){ grid(0,0,false,'PLAYER 1 SEA'); grid(1,1,false,'PLAYER 2 SEA'); return; }
      grid(0,own,true,'YOUR FLEET'); grid(1,opp,false,'ENEMY WATERS');
      if(!S.ph&&me===S.p&&S.k[me]<5){ const c=sbCell(0,ui.mx,ui.my), L=FLEET[S.k[me]], hz=!ui.rot;
        if(c){ const ok=sbFits(S.s[me],L,c[0],c[1],hz); g.fillStyle=ok?'rgba(120,220,120,.6)':'rgba(220,80,60,.6)'; for(let t=0;t<L;t++){ const cx=c[0]+(hz?t:0), cy=c[1]+(hz?0:t); if(cx<10&&cy<10)g.fillRect(sbGX[0]+cx*sbC+2,sbGY+cy*sbC+2,sbC-4,sbC-4); } }
        TG.btn(g,ui,'rnd',24,400,180,34,'RANDOM FLEET'); TG.btn(g,ui,'rot',214,400,130,34,hz?'ACROSS':'DOWN'); TG.text(g,'NEXT: '+SBN[S.k[me]]+' ('+L+')',260,460,{s:13}); }
      else if(!S.ph)TG.text(g,'WAITING FOR THE OTHER ADMIRAL.',260,420,{s:13});
      else if(me===S.p){ const c=sbCell(1,ui.mx,ui.my); if(c&&S.h[opp][c[1]*10+c[0]]==='.'){ ring(g,sbGX[1]+c[0]*sbC+11,sbGY+c[1]*sbC+11,9,'#ffd040',3); } TG.text(g,'FIRE AT A SQUARE OF THE ENEMY WATERS.',260,420,{s:13}); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const b=TG.hit(ui,x,y);
      if(!S.ph){ if(b==='rnd')return 'RANDOM'; if(b==='rot'){ ui.rot=!ui.rot; return null; } const c=sbCell(0,x,y); if(!c)return null; const m=(ui.rot?0:100)+c[1]*10+c[0]; return D.seabattle.moves(S).includes(m)?m:null; }
      const c=sbCell(1,x,y); if(!c)return null; const i=c[1]*10+c[0]; return S.h[1-me][i]==='.'?i:null; }};

  /* ---------- the hopping races (Chinese Checkers, Halma): step to a free neighbour or hop over pieces as far as a chain goes; fill the far camp ---------- */
  const hopTo=(b,i,N,J)=>{ const out=new Set(), seen=new Set([i]), q=[i]; for(const j of N[i])if(j>=0&&b[j]==='.')out.add(j);
    while(q.length){ const a=q.pop(); for(let k=0;k<N[a].length;k++){ const o=N[a][k], l=J[a][k]; if(o<0||l<0||o===i||b[o]==='.'||seen.has(l)||(b[l]!=='.'&&l!==i))continue; seen.add(l); out.add(l); q.push(l); } }
    out.delete(i); return [...out]; };
  // a piece in its goal stays in it; you win when the goal is full and every other piece in it never left its own home
  const hopMoves=(S,N,J,goal)=>{ const c=''+S.p, g=goal(S.p), out=[]; for(let i=0;i<S.b.length;i++)if(S.b[i]===c)for(const t of hopTo(S.b,i,N,J))if(!g.has(i)||g.has(t))out.push([i,t]); return out; };
  const hopWon=(S,k,goal,home)=>{ let mine=0; for(const i of goal(k)){ const v=S.b[i]; if(v==='.')return false; if(v===''+k)mine++; else if(!home(+v).has(i))return false; } return mine>0; };
  const hopAi=(S,rnd,M,dist)=>best(M,m=>dist(m[0],S.p)*1.01-dist(m[1],S.p)+rnd()*.3);
  const hopOver=(S,np,goal,home,dist,cap)=>{ for(let k=0;k<np;k++)if(hopWon(S,k,goal,home))return {win:[k],text:CN[k]+' FILLS THE FAR CAMP AND WINS.'};
    if(S.n>=cap){ const t=[...Array(np)].map((_,k)=>{ let s=0; for(let i=0;i<S.b.length;i++)if(S.b[i]===''+k)s+=dist(i,k); return s; }), m=Math.min(...t), w=t.map((v,k)=>v===m?k:-1).filter(k=>k>=0); return {win:w,text:'TIME! '+w.map(k=>CN[k]).join(' AND ')+' GOT FURTHEST.'}; } return null; };
  const hopDraw=(g,S,me,ui,P,r,mv)=>{ const M=me===S.p?mv(S):[], src=new Set(M.map(m=>m[0])), tg=new Set(M.filter(m=>m[0]===ui.sel).map(m=>m[1]));
    P.forEach(([x,y],i)=>{ const v=S.b[i]; if(tg.has(i))ring(g,x,y,r+3,'#ffd040',3); if(v!=='.'){ disc(g,x,y,r,COL[+v],'#1c1c22',2); disc(g,x-r*.3,y-r*.3,r*.3,'rgba(255,255,255,.45)',null); if(src.has(i))ring(g,x,y,r+3,i===ui.sel?'#ff8020':'#ffd040',3); } }); };
  const hopClick=(S,me,x,y,ui,P,r,mv)=>{ if(me!==S.p)return null; const M=mv(S), i=near(P,x,y,r+4); if(i<0)return null; if(ui.sel!=null&&has(M,[ui.sel,i]))return [ui.sel,i]; ui.sel=M.some(m=>m[0]===i)?i:null; return null; };

  /* ---------- CHINESE CHECKERS: 2, 3 or 4 players race ten marbles across the six-pointed star ---------- */
  const CC=[], CCI={}; for(let r=-8;r<=8;r++)for(let q=-8;q<=8;q++){ const s=-q-r; if(q<=4&&r<=4&&s<=4||q>=-4&&r>=-4&&s>=-4){ CCI[q+','+r]=CC.length; CC.push([q,r,s]); } }
  const CCD=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]], CCN=CC.map(([q,r])=>CCD.map(([a,b])=>CCI[(q+a)+','+(r+b)]??-1)), CCJ=CC.map(([q,r])=>CCD.map(([a,b])=>CCI[(q+2*a)+','+(r+2*b)]??-1));
  const ccCorner=([q,r,s])=>r<-4?0:q>4?1:s<-4?2:r>4?3:q<-4?4:s>4?5:-1, CCC=[0,1,2,3,4,5].map(c=>new Set(CC.map((h,i)=>ccCorner(h)===c?i:-1).filter(i=>i>=0)));
  const CCA=[[4,-8,4],[8,-4,-4],[4,4,-8],[-4,8,-4],[-8,4,4],[-4,-4,8]], CCS={2:[0,3],3:[0,2,4],4:[1,2,4,5]};
  const CCP=CC.map(([q,r])=>[260+(q+r/2)*31,260+r*31*.866]);
  const ccHome=S=>k=>CCC[CCS[S.np][k]], ccGoal=S=>k=>CCC[(CCS[S.np][k]+3)%6], ccDist=S=>(i,k)=>{ const a=CCA[(CCS[S.np][k]+3)%6], h=CC[i]; return Math.max(Math.abs(h[0]-a[0]),Math.abs(h[1]-a[1]),Math.abs(h[2]-a[2])); };
  const ccMoves=S=>D.chinesecheckers.over(S)?[]:hopMoves(S,CCN,CCJ,ccGoal(S));
  D.chinesecheckers={name:'Chinese Checkers',kind:'board',min:2,max:4,help:'Move a marble to a free hole next to it, or hop over any marble to a free hole beyond, again and again in one move. First to fill the opposite point of the star wins.',
    init:n=>{ let b=''; for(let i=0;i<CC.length;i++){ const k=CCS[n].indexOf(ccCorner(CC[i])); b+=k>=0?''+k:'.'; } return {b,p:0,np:n,n:0}; },
    moves:ccMoves, play:(S,m)=>{ S.b=setc(setc(S.b,m[0],'.'),m[1],S.b[m[0]]); S.n++; S.p=(S.p+1)%S.np; return S; },
    over:S=>hopOver(S,S.np,ccGoal(S),ccHome(S),ccDist(S),160*S.np),
    ai:(S,rnd)=>hopAi(S,rnd,ccMoves(S),ccDist(S)),
    status:S=>CN[S.p]+' TO MOVE · MOVE '+(S.n+1)+' OF '+160*S.np+'.',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#4a3220'); g.fillStyle='#c8a46a';
      for(const T of [[0,2,4],[1,3,5]]){ g.beginPath(); T.forEach((c,j)=>{ const a=CCA[c], x=260+(a[0]+a[1]/2)*31*1.12, y=260+a[1]*31*.866*1.12; j?g.lineTo(x,y):g.moveTo(x,y); }); g.closePath(); g.fill(); }
      CCP.forEach(([x,y],i)=>{ const c=ccCorner(CC[i]), k=c<0?-1:CCS[S.np].indexOf(c), kg=c<0?-1:CCS[S.np].indexOf((c+3)%6); disc(g,x,y,9,k>=0?COL[k]+'66':kg>=0?COL[kg]+'33':'#6a4a2a','#3b2a1e',1); });
      hopDraw(g,S,me,ui,CCP,11,ccMoves); },
    click:(S,me,x,y,ui)=>hopClick(S,me,x,y,ui,CCP,11,ccMoves)};

  /* ---------- HALMA: hop pieces across a 16x16 board from your corner camp into the one opposite ---------- */
  const HN=[...Array(256)].map((_,i)=>{ const x=i%16, y=i>>4, n=[], j=[]; for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){ if(!dx&&!dy)continue; const ok=(a,b)=>a>=0&&a<16&&b>=0&&b<16;
    n.push(ok(x+dx,y+dy)?(y+dy)*16+x+dx:-1); j.push(ok(x+2*dx,y+2*dy)?(y+2*dy)*16+x+2*dx:-1); } return [n,j]; }), HNN=HN.map(a=>a[0]), HNJ=HN.map(a=>a[1]);
  const HROWS={2:[5,5,4,3,2],3:[4,4,3,2],4:[4,4,3,2]}, HAP=[[0,0],[15,0],[15,15],[0,15]];
  const hCamp=(n,c)=>{ const s=new Set(); HROWS[n].forEach((w,y)=>{ for(let x=0;x<w;x++){ const X=c===1||c===2?15-x:x, Y=c>=2?15-y:y; s.add(Y*16+X); } }); return s; };
  const HC={}; for(const n of [2,3,4])HC[n]=[0,1,2,3].map(c=>hCamp(n,c)); const HS={2:[0,2],3:[0,1,2],4:[0,1,2,3]};
  const haHome=S=>k=>HC[S.np][HS[S.np][k]], haGoal=S=>k=>HC[S.np][(HS[S.np][k]+2)%4], haDist=S=>(i,k)=>{ const a=HAP[(HS[S.np][k]+2)%4]; return Math.abs(i%16-a[0])+Math.abs((i>>4)-a[1]); };
  const HAP2=[...Array(256)].map((_,i)=>[12+(i%16)*31+15.5,12+(i>>4)*31+15.5]);
  const haMoves=S=>D.halma.over(S)?[]:hopMoves(S,HNN,HNJ,haGoal(S));
  D.halma={name:'Halma',kind:'board',min:2,max:4,help:'Move a piece to any free square around it, or hop over pieces to free squares beyond, as many hops as you like in one move. First to fill the camp in the opposite corner wins.',
    init:n=>{ let b=''; for(let i=0;i<256;i++){ const k=HS[n].findIndex(c=>HC[n][c].has(i)); b+=k>=0?''+k:'.'; } return {b,p:0,np:n,n:0}; },
    moves:haMoves, play:(S,m)=>{ S.b=setc(setc(S.b,m[0],'.'),m[1],S.b[m[0]]); S.n++; S.p=(S.p+1)%S.np; return S; },
    over:S=>hopOver(S,S.np,haGoal(S),haHome(S),haDist(S),220*S.np),
    ai:(S,rnd)=>hopAi(S,rnd,haMoves(S),haDist(S)),
    status:S=>CN[S.p]+' TO MOVE · MOVE '+(S.n+1)+' OF '+220*S.np+'.',
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#4a3220');
      for(let i=0;i<256;i++){ const x=12+(i%16)*31, y=12+(i>>4)*31, k=HS[S.np].findIndex(c=>HC[S.np][c].has(i)); g.fillStyle=((i%16)+(i>>4))%2?'#d8c098':'#c4a87a'; g.fillRect(x,y,31,31);
        const c=[0,1,2,3].find(c=>HC[S.np][c].has(i)); if(c!=null){ const o=HS[S.np].indexOf(c), og=HS[S.np].indexOf((c+2)%4); g.fillStyle=(o>=0?COL[o]:og>=0?COL[og]:'#888')+(o>=0?'55':'30'); g.fillRect(x,y,31,31); } if(k<-1)g.fillRect(0,0,0,0); }
      g.strokeStyle='#3b2a1e'; g.lineWidth=2; g.strokeRect(12,12,496,496); hopDraw(g,S,me,ui,HAP2,11,haMoves); },
    click:(S,me,x,y,ui)=>hopClick(S,me,x,y,ui,HAP2,11,haMoves)};

  /* ---------- LUDO: roll a six to leave home, race your four round the cross and up your own column; landing on a rival sends it home ---------- */
  const LP=[]; const seg=(x,y,dx,dy,n)=>{ for(let k=0;k<n;k++)LP.push([x+dx*k,y+dy*k]); };
  seg(1,6,1,0,5); seg(6,5,0,-1,6); seg(7,0,1,0,1); seg(8,0,0,1,6); seg(9,6,1,0,6); seg(14,7,0,1,1); seg(14,8,-1,0,6); seg(8,9,0,1,6); seg(7,14,-1,0,1); seg(6,14,0,-1,6); seg(5,8,-1,0,6); seg(0,7,0,-1,1); seg(0,6,1,0,1);
  const LCOL=['#c0242c','#2a9a4a','#e0b020','#2a6ad0'], LCN=['RED','GREEN','YELLOW','BLUE'], LSEAT={2:[0,2],3:[0,1,2],4:[0,1,2,3]}, LSAFE=new Set([0,8,13,21,26,34,39,47]), LCS=34, LO=5;
  const lRot=([c,r],k)=>{ for(let i=0;i<k;i++)[c,r]=[14-r,c]; return [c,r]; };
  const lCol=(S,p)=>LSEAT[S.np][p], lAbs=(S,p,t)=>(lCol(S,p)*13+t)%52;
  const lCell=(S,p,j)=>{ const t=S.t[p*4+j], c=lCol(S,p); if(t<0)return lRot([[1.5,1.5],[3.5,1.5],[1.5,3.5],[3.5,3.5]][j],c); if(t<=50)return LP[lAbs(S,p,t)]; if(t<56)return lRot([t-50,7],c); return lRot([6.2,6.4+j*.2],c); };
  const lPx=([c,r])=>[LO+(c+.5)*LCS,LO+(r+.5)*LCS];
  const lCan=(S,p,j)=>{ const t=S.t[p*4+j]; return t<0?S.d===6:t<56&&t+S.d<=56; };
  const lMoves=S=>{ if(D.ludo.over(S))return []; if(!S.d)return ['ROLL']; return [0,1,2,3].filter(j=>lCan(S,S.p,j)); };
  const lFoes=(S,a)=>{ const r=[]; for(let q=0;q<S.np;q++)if(q!==S.p)for(let j=0;j<4;j++){ const t=S.t[q*4+j]; if(t>=0&&t<=50&&lAbs(S,q,t)===a)r.push(q*4+j); } return r; };
  D.ludo={name:'Ludo',kind:'board',min:2,max:4,help:'Roll the die and move a token; a six brings a token out of home and rolls again. Land on a rival (off the starred squares) to send it home. First to bring all four tokens to the middle wins.',
    init:n=>({t:Array(n*4).fill(-1),p:0,np:n,d:0,n:0,m:''}),
    moves:lMoves,
    play:(S,m)=>{ S.n++; if(m==='ROLL'){ S.d=d6(TG.rng(S)); S.m='ROLLED '+S.d+'.'; if(![0,1,2,3].some(j=>lCan(S,S.p,j))){ S.m='ROLLED '+S.d+': NO MOVE.'; S.d=0; S.p=(S.p+1)%S.np; } return S; }
      const i=S.p*4+m, t=S.t[i], nt=t<0?0:t+S.d, d=S.d; S.t[i]=nt; S.m='';
      if(nt<=50){ const a=lAbs(S,S.p,nt); if(!LSAFE.has(a))for(const f of lFoes(S,a)){ S.t[f]=-1; S.m='SENT '+LCN[lCol(S,f>>2)]+' HOME!'; } } if(nt===56)S.m='A TOKEN IS HOME!';
      S.d=0; if(d!==6)S.p=(S.p+1)%S.np; return S; },
    over:S=>{ for(let p=0;p<S.np;p++)if([0,1,2,3].every(j=>S.t[p*4+j]===56))return {win:[p],text:LCN[lCol(S,p)]+' BRINGS ALL FOUR HOME AND WINS.'};
      if(S.n>=1400){ const t=[...Array(S.np)].map((_,p)=>sum([0,1,2,3].map(j=>S.t[p*4+j]))), m=Math.max(...t), w=t.map((v,p)=>v===m?p:-1).filter(p=>p>=0); return {win:w,text:'TIME! '+w.map(p=>LCN[lCol(S,p)]).join(' AND ')+' GOT FURTHEST.'}; } return null; },
    ai:(S,rnd)=>{ const M=lMoves(S); if(M[0]==='ROLL')return 'ROLL';
      const risk=(a)=>{ if(LSAFE.has(a))return 0; for(let q=0;q<S.np;q++)if(q!==S.p)for(let j=0;j<4;j++){ const t=S.t[q*4+j]; if(t>=0&&t<=50){ const g=(a-lAbs(S,q,t)+52)%52; if(g>=1&&g<=6&&t+g<=50)return 1; } } return 0; };
      return best(M,j=>{ const t=S.t[S.p*4+j], nt=t<0?0:t+S.d; let v=t<0?40:S.d; if(nt===56)v+=35; else if(nt>50)v+=15;
        if(nt<=50){ const a=lAbs(S,S.p,nt); if(!LSAFE.has(a)&&lFoes(S,a).length)v+=60; if(LSAFE.has(a))v+=8; v-=risk(a)*22; } if(t>=0&&t<=50&&risk(lAbs(S,S.p,t)))v+=14; return v+rnd(); }); },
    status:S=>LCN[lCol(S,S.p)]+': '+(S.d?'ROLLED '+S.d+', MOVE A TOKEN.':'ROLL THE DIE.')+(S.m&&!S.d?' ('+S.m+')':''),
    draw:(g,S,me,ui,W,H)=>{ g.fillStyle='#3a2416'; g.fillRect(0,0,W,H); g.fillStyle='#f4ecd8'; g.fillRect(LO,LO,LCS*15,LCS*15);
      const sq=(c,r,f)=>{ g.fillStyle=f; g.fillRect(LO+c*LCS,LO+r*LCS,LCS,LCS); };
      for(let c=0;c<4;c++){ const [a,b]=lRot([0,0],c), x=Math.min(a,lRot([5,5],c)[0]), y=Math.min(b,lRot([5,5],c)[1]); g.fillStyle=LCOL[c]; g.fillRect(LO+x*LCS,LO+y*LCS,6*LCS,6*LCS); g.fillStyle='#f4ecd8'; g.fillRect(LO+(x+1)*LCS,LO+(y+1)*LCS,4*LCS,4*LCS);
        for(let k=1;k<=5;k++){ const [hc,hr]=lRot([k,7],c); sq(hc,hr,LCOL[c]); } const [sc,sr]=LP[c*13]; sq(sc,sr,LCOL[c]); }
      g.strokeStyle='#8a7a60'; g.lineWidth=1; for(const [c,r] of LP)g.strokeRect(LO+c*LCS,LO+r*LCS,LCS,LCS);
      for(let c=0;c<4;c++)for(let k=1;k<=5;k++){ const [hc,hr]=lRot([k,7],c); g.strokeRect(LO+hc*LCS,LO+hr*LCS,LCS,LCS); }
      for(const a of LSAFE)if(a%13){ const [x,y]=lPx(LP[a]); TG.text(g,'★',x,y+1,{s:20,c:'#9a8a60'}); }
      const C=[LO+7.5*LCS,LO+7.5*LCS]; for(let c=0;c<4;c++){ const P=[[6,6],[6,9],[7.5,7.5]].map(p=>lRot(p,c)); g.beginPath(); P.forEach(([x,y],j)=>{ const X=LO+x*LCS, Y=LO+y*LCS; j?g.lineTo(X,Y):g.moveTo(X,Y); }); g.closePath(); g.fillStyle=LCOL[c]; g.fill(); }
      const M=me===S.p?lMoves(S):[], cnt={};
      for(let p=0;p<S.np;p++)for(let j=0;j<4;j++){ const cell=lCell(S,p,j), k=cell.join(','), o=(cnt[k]=(cnt[k]||0)+1)-1, [x,y]=lPx(cell), r=S.t[p*4+j]===56?7:12, X=x+o*5-(S.t[p*4+j]>=0?4:0), Y=y-o*5;
        disc(g,X,Y,r,LCOL[lCol(S,p)],'#1c1c22',2); disc(g,X,Y,r*.45,'rgba(255,255,255,.5)',null); if(p===S.p&&M.includes(j))ring(g,X,Y,r+4,'#ffd040',3); }
      if(S.d)TG.die(g,C[0]-22,C[1]-22,S.d,44); else if(me===S.p&&M[0]==='ROLL')TG.btn(g,ui,'roll',C[0]-40,C[1]-16,80,32,'ROLL'); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const M=lMoves(S); if(M[0]==='ROLL')return TG.hit(ui,x,y)==='roll'||Math.abs(x-260)<60&&Math.abs(y-260)<60?'ROLL':null;
      let o={}; for(const j of M){ const k=lCell(S,S.p,j).join(','); if(o[k])continue; o[k]=1; const [px,py]=lPx(lCell(S,S.p,j)); if((px-x)**2+(py-y)**2<18*18)return j; } return null; }};

  /* ---------- SNAKES AND LADDERS: roll and race to square 100; ladders climb, snakes slide ---------- */
  const SN={16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78}, LD={1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
  const snXY=k=>{ const row=Math.floor((k-1)/10), col=row%2?9-(k-1)%10:(k-1)%10; return [10+col*50+25,10+(9-row)*50+25]; };
  D.snakes={name:'Snakes and Ladders',kind:'board',min:2,max:4,help:'Roll and move along the numbered squares. A ladder foot climbs you up, a snake head slides you down. Land exactly on 100 to win.',
    init:n=>({q:Array(n).fill(0),p:0,np:n,n:0,d:0,m:''}),
    moves:S=>D.snakes.over(S)?[]:['ROLL'],
    play:(S,m)=>{ S.n++; const d=S.d=d6(TG.rng(S)), t=S.q[S.p]+d; S.m='ROLLED '+d+'.'; if(t>100)S.m+=' TOO FAR.'; else { S.q[S.p]=t; if(SN[t]){ S.q[S.p]=SN[t]; S.m+=' A SNAKE!'; } else if(LD[t]){ S.q[S.p]=LD[t]; S.m+=' A LADDER!'; } }
      if(S.q[S.p]!==100)S.p=(S.p+1)%S.np; return S; },
    over:S=>{ const w=S.q.indexOf(100); if(w>=0)return {win:[w],text:CN[w]+' REACHES 100 AND WINS.'}; if(S.n>=220*S.np){ const m=Math.max(...S.q), W=S.q.map((v,p)=>v===m?p:-1).filter(p=>p>=0); return {win:W,text:'TIME! '+W.map(p=>CN[p]).join(' AND ')+' GOT FURTHEST.'}; } return null; },
    status:S=>CN[S.p]+' TO ROLL.'+(S.m?' (LAST: '+S.m+')':''),
    draw:(g,S,me,ui,W,H)=>{ g.fillStyle='#3a2416'; g.fillRect(0,0,W,H);
      for(let k=1;k<=100;k++){ const [x,y]=snXY(k); g.fillStyle=['#f4e4c0','#e8c890','#f0d4a8','#dcb880'][(k+Math.floor((k-1)/10))%4]; g.fillRect(x-25,y-25,50,50); TG.text(g,''+k,x-14,y-16,{s:10,c:'#6a4a2a'}); }
      for(const a in LD){ const [x1,y1]=snXY(+a), [x2,y2]=snXY(LD[a]), L=Math.hypot(x2-x1,y2-y1), nx=-(y2-y1)/L*8, ny=(x2-x1)/L*8; g.strokeStyle='#7a4a1a'; g.lineWidth=4;
        for(const s of [-1,1]){ g.beginPath(); g.moveTo(x1+nx*s,y1+ny*s); g.lineTo(x2+nx*s,y2+ny*s); g.stroke(); } g.lineWidth=3; for(let t=14;t<L;t+=16){ const f=t/L, X=x1+(x2-x1)*f, Y=y1+(y2-y1)*f; g.beginPath(); g.moveTo(X-nx,Y-ny); g.lineTo(X+nx,Y+ny); g.stroke(); } }
      let si=0; for(const a in SN){ const [x1,y1]=snXY(+a), [x2,y2]=snXY(SN[a]), L=Math.hypot(x2-x1,y2-y1), nx=-(y2-y1)/L, ny=(x2-x1)/L, c=['#3a9a3a','#c04a2a','#2a7ab0','#9a5ab0','#c09020'][si++%5];
        g.strokeStyle=c; g.lineCap='round'; g.lineWidth=9; g.beginPath(); g.moveTo(x1,y1); const n=Math.max(3,Math.round(L/45)); for(let k=1;k<=n;k++){ const f=k/n, w=(k%2?1:-1)*18; g.quadraticCurveTo(x1+(x2-x1)*(f-.5/n)+nx*w,y1+(y2-y1)*(f-.5/n)+ny*w,x1+(x2-x1)*f,y1+(y2-y1)*f); } g.stroke(); g.lineCap='butt';
        disc(g,x1,y1,8,c,'#1c1c22',2); disc(g,x1-3,y1-2,1.6,'#fff',null); disc(g,x1+3,y1-2,1.6,'#fff',null); }
      S.q.forEach((v,p)=>{ const [x,y]=v?snXY(v):[10-2,500], o=[[-9,-9],[9,-9],[-9,9],[9,9]][p]; disc(g,(v?x:22)+o[0],(v?y:488)+o[1],10,COL[p],'#1c1c22',2); if(p===S.p)ring(g,(v?x:22)+o[0],(v?y:488)+o[1],13,'#ffd040',2); });
      if(S.d)TG.die(g,470,12,S.d,36); if(me===S.p&&!D.snakes.over(S))TG.btn(g,ui,'roll',210,4,100,30,'ROLL'); },
    click:(S,me)=>me===S.p&&!D.snakes.over(S)?'ROLL':null};

  /* ---------- DOMINOES (block game, double-six): match an open end; draw from the boneyard when stuck; out first scores the others' pips ---------- */
  const DT=[]; for(let a=0;a<7;a++)for(let b=a;b<7;b++)DT.push([a,b]);
  const DPIP={0:[],1:[[1,1]],2:[[0,0],[2,2]],3:[[0,0],[1,1],[2,2]],4:[[0,0],[2,0],[0,2],[2,2]],5:[[0,0],[2,0],[1,1],[0,2],[2,2]],6:[[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]]};
  const dHalf=(g,x,y,s,v)=>{ for(const [i,j] of DPIP[v])disc(g,x+s*(.22+i*.28),y+s*(.22+j*.28),Math.max(1.5,s*.08),'#1c1c22',null); };
  const dTile=(g,x,y,w,h,a,b,up=true,hi=0)=>{ g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x+2,y+2,w,h); g.fillStyle=up?'#fbf6ea':'#2a2a30'; g.fillRect(x,y,w,h); g.strokeStyle=hi?'#e0a020':'#3b2a1e'; g.lineWidth=hi?3:1; g.strokeRect(x+.5,y+.5,w-1,h-1);
    if(!up)return; g.strokeStyle='#3b2a1e'; g.lineWidth=1; g.beginPath(); if(w>h){ g.moveTo(x+w/2,y+3); g.lineTo(x+w/2,y+h-3); g.stroke(); dHalf(g,x,y,h,a); dHalf(g,x+w/2,y,h,b); } else { g.moveTo(x+3,y+h/2); g.lineTo(x+w-3,y+h/2); g.stroke(); dHalf(g,x,y,w,a); dHalf(g,x,y+h/2,w,b); } };
  const dPips=h=>sum(h.map(t=>DT[t][0]+DT[t][1]));
  const dDeal=(S,rnd)=>{ const k=TG.shuffle([...Array(28).keys()],rnd), hs=S.np===2?7:5; S.h=[...Array(S.np)].map(()=>k.splice(0,hs)); S.y=k; S.c=[]; S.e=null; S.ps=0; S.st=0; S.p=(S.rd-1)%S.np; };
  const dPlay=S=>{ const out=[]; for(const t of S.h[S.p]){ const [a,b]=DT[t]; if(!S.e){ out.push([t,1]); continue; } if(a===S.e[0]||b===S.e[0])out.push([t,0]); if(a===S.e[1]||b===S.e[1])out.push([t,1]); } return out; };
  const dOver=S=>{ if(!S.st)return null; const m=Math.max(...S.sc); if(m<100&&S.rd<5)return null; const w=S.sc.map((v,p)=>v===m?p:-1).filter(p=>p>=0); return {win:w,text:w.map(p=>CN[p]).join(' AND ')+' WINS WITH '+m+' POINTS.'}; };
  const dMoves=S=>{ if(dOver(S))return []; if(S.st)return ['NEXT']; const M=dPlay(S); return M.length?M:[S.y.length?'DRAW':'PASS']; };
  const dEnd=(S,w)=>{ const pts=sum(S.h.map((h,p)=>p===w?0:dPips(h))); S.st=1; if(w>=0){ S.sc[w]+=pts; S.m=CN[w]+' SCORES '+pts+'.'; } else S.m='BLOCKED, A TIE: NO SCORE.'; };
  const dHand=n=>{ const tw=Math.min(30,Math.floor(470/n)-3), th=Math.min(60,tw*2); return {tw,th,x0:260-n*(tw+3)/2,y:512-th}; };
  D.dominoes={name:'Dominoes',kind:'board',min:2,max:4,help:'Play a domino matching an open end of the line; stuck, draw from the boneyard, or pass when it is empty. Going out (or the lowest hand when blocked) scores the pips left in the other hands. First to 100, or best after five rounds.',
    init:(n,rnd)=>{ const S={np:n,sc:Array(n).fill(0),rd:1,m:'',p:0}; dDeal(S,rnd); return S; },
    moves:dMoves,
    play:(S,m)=>{ if(m==='NEXT'){ S.rd++; dDeal(S,TG.rng(S)); S.m=''; return S; } if(m==='DRAW'){ S.h[S.p].push(S.y.pop()); S.ps=0; return S; }
      if(m==='PASS'){ S.ps++; if(S.ps>=S.np){ const P=S.h.map(dPips), lo=Math.min(...P), w=P.filter(v=>v===lo).length>1?-1:P.indexOf(lo); dEnd(S,w); if(w>=0)S.p=w; } else S.p=(S.p+1)%S.np; return S; }
      const [t,side]=m, [a,b]=DT[t]; S.h[S.p].splice(S.h[S.p].indexOf(t),1); S.ps=0;
      if(!S.e){ S.c=[t*2]; S.e=[a,b]; } else if(side===0){ if(b===S.e[0]){ S.c.unshift(t*2); S.e[0]=a; } else { S.c.unshift(t*2+1); S.e[0]=b; } } else { if(a===S.e[1]){ S.c.push(t*2); S.e[1]=b; } else { S.c.push(t*2+1); S.e[1]=a; } }
      if(!S.h[S.p].length)dEnd(S,S.p); else S.p=(S.p+1)%S.np; return S; },
    over:dOver,
    ai:S=>{ const M=dMoves(S); if(typeof M[0]==='string')return M[0]; return best(M,([t])=>DT[t][0]+DT[t][1]+(DT[t][0]===DT[t][1]?3:0)); },
    status:(S,me)=>'ROUND '+S.rd+' · '+S.sc.map((v,p)=>(p===me?'YOU':CN[p])+' '+v).join(' · ')+(S.m?' · '+S.m:''),
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#2a5a3a'); const M=me===S.p?dMoves(S):[], n=S.c.length, per=10, rows=Math.ceil(n/per)||1, y0=260-rows*16;
      S.c.forEach((v,k)=>{ const row=Math.floor(k/per), col=k%per, rev=row%2, cnt=Math.min(per,n-row*per), x0=260-cnt*23, x=rev?x0+(cnt-1-col)*46:x0+col*46, [a,b]=DT[v>>1], f=v&1;
        let A=f?b:a, B=f?a:b; if(rev)[A,B]=[B,A]; dTile(g,x,y0+row*32,44,22,A,B,true,(k===0||k===n-1)&&ui.sel!=null); });
      if(!n)TG.text(g,'PLAY ANY DOMINO TO START.',260,260,{s:13});
      for(let p=0;p<S.np;p++){ const pos=seatAt(p,me,S.np), h=S.h[p], up=p===me;
        if(pos===0){ const L=dHand(h.length); h.forEach((t,k)=>{ const ok=M.some(m=>Array.isArray(m)&&m[0]===t), x=L.x0+k*(L.tw+3); dTile(g,x,L.y-(ok&&up?6:0)-(ui.sel===t&&up?6:0),L.tw,L.th,DT[t][0],DT[t][1],up,up&&ok); }); }
        else { const vert=pos!==2, nn=Math.min(h.length,12); for(let k=0;k<nn;k++){ if(vert)dTile(g,pos===1?8:478,120+k*22,34,18,0,0,false); else dTile(g,260-nn*11+k*22,8,18,34,0,0,false); }
          TG.text(g,(CN[p])+' · '+h.length,pos===1?50:pos===3?470:260,pos===2?56:108,{s:11,b:1,c:COL[p]}); } }
      TG.text(g,'BONEYARD '+S.y.length,70,24,{s:11}); if(me>=0)TG.text(g,'YOU ARE '+CN[me],450,24,{s:11,b:1,c:COL[me]});
      if(me===S.p){ if(M[0]==='DRAW')TG.btn(g,ui,'draw',200,370,120,30,'DRAW'); if(M[0]==='PASS')TG.btn(g,ui,'pass',200,370,120,30,'PASS');
        if(ui.sel!=null&&has(M,[ui.sel,0])&&has(M,[ui.sel,1])){ TG.btn(g,ui,'L',130,370,120,30,'LEFT END'); TG.btn(g,ui,'R',270,370,120,30,'RIGHT END'); } }
      if(S.st&&!dOver(S)&&me===S.p)TG.btn(g,ui,'next',190,370,140,30,'NEXT ROUND'); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const M=dMoves(S), b=TG.hit(ui,x,y);
      if(b==='draw')return 'DRAW'; if(b==='pass')return 'PASS'; if(b==='next')return 'NEXT'; if((b==='L'||b==='R')&&ui.sel!=null){ const m=[ui.sel,b==='L'?0:1]; return has(M,m)?m:null; }
      const h=S.h[me], L=dHand(h.length); for(let k=0;k<h.length;k++){ const X=L.x0+k*(L.tw+3); if(x>=X&&x<X+L.tw+3&&y>=L.y-14&&y<L.y+L.th){ const t=h[k], o=M.filter(m=>Array.isArray(m)&&m[0]===t); if(o.length===1)return o[0];
        if(o.length>1&&S.e&&S.e[0]===S.e[1])return o[1]; ui.sel=o.length?t:null; return null; } } return null; }};

  /* ---------- DOTS AND BOXES: draw a line between two dots; close a box to claim it and draw again ---------- */
  const DBE=(r,c)=>[r*5+c,(r+1)*5+c,30+r*6+c,31+r*6+c], DBB=[...Array(60)].map((_,e)=>{ const o=[]; for(let b=0;b<25;b++)if(DBE(Math.floor(b/5),b%5).includes(e))o.push(b); return o; });
  const dbSides=(e,b)=>DBE(Math.floor(b/5),b%5).filter(x=>e[x]!=='.').length;
  const dbMid=e=>e<30?[40+(e%5)*88+44,40+Math.floor(e/5)*88]:[40+((e-30)%6)*88,40+Math.floor((e-30)/6)*88+44];
  const dbFree=S=>[...S.e].map((v,i)=>v==='.'?i:-1).filter(i=>i>=0);
  D.dotsboxes={name:'Dots and Boxes',kind:'board',min:2,max:4,help:'Take turns drawing a line between two neighbouring dots. Close the fourth side of a box to claim it and draw again. Most boxes wins.',
    init:n=>({e:'.'.repeat(60),o:'.'.repeat(25),p:0,np:n}),
    moves:S=>dbFree(S),
    play:(S,m)=>{ S.e=setc(S.e,m,''+S.p); let got=0; for(const b of DBB[m])if(S.o[b]==='.'&&dbSides(S.e,b)===4){ S.o=setc(S.o,b,''+S.p); got++; } if(!got)S.p=(S.p+1)%S.np; return S; },
    over:S=>{ if(S.e.includes('.'))return null; const c=[...Array(S.np)].map((_,p)=>[...S.o].filter(v=>v===''+p).length), m=Math.max(...c), w=c.map((v,p)=>v===m?p:-1).filter(p=>p>=0); return {win:w,text:w.map(p=>CN[p]).join(' AND ')+(w.length>1?' SHARE IT':' WINS')+' WITH '+m+' BOXES.'}; },
    ai:(S,rnd)=>{ const F=dbFree(S), take=F.filter(e=>DBB[e].some(b=>dbSides(S.e,b)===3)); if(take.length)return take[0];
      const safe=F.filter(e=>DBB[e].every(b=>dbSides(S.e,b)<2)); if(safe.length)return safe[Math.floor(rnd()*safe.length)];
      // every line gives boxes away: give the fewest
      return best(F,e=>{ let x=setc(S.e,e,'9'), n=0; for(;;){ const t=dbFree({e:x}).find(f=>DBB[f].some(b=>dbSides(x,b)===3)); if(t==null)break; for(const b of DBB[t])if(dbSides(x,b)===3)n++; x=setc(x,t,'9'); } return -n+rnd()*.1; }); },
    status:(S,me)=>[...Array(S.np)].map((_,p)=>(p===me?'YOU':CN[p])+' '+[...S.o].filter(v=>v===''+p).length).join(' · '),
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#e8d6a8'); for(let b=0;b<25;b++)if(S.o[b]!=='.'){ const x=40+(b%5)*88, y=40+Math.floor(b/5)*88; g.fillStyle=COL[+S.o[b]]+'88'; g.fillRect(x+4,y+4,80,80); TG.text(g,CN[+S.o[b]][0],x+44,y+44,{b:1,s:30,c:'#3b2a1e',serif:1}); }
      const hov=me===S.p?D.dotsboxes.pick(S,ui.mx,ui.my):-1;
      for(let e=0;e<60;e++){ const v=S.e[e]; if(v==='.'&&e!==hov)continue; const [mx,my]=dbMid(e), h=e<30; g.strokeStyle=v==='.'?'rgba(224,160,32,.8)':COL[+v]; g.lineWidth=7; g.beginPath(); g.moveTo(mx-(h?44:0),my-(h?0:44)); g.lineTo(mx+(h?44:0),my+(h?0:44)); g.stroke(); }
      for(let r=0;r<6;r++)for(let c=0;c<6;c++)disc(g,40+c*88,40+r*88,7,'#3b2a1e',null); },
    pick:(S,x,y)=>{ if(x==null)return -1; const P=[...Array(60)].map((_,e)=>dbMid(e)), e=near(P,x,y,34); return e>=0&&S.e[e]==='.'?e:-1; },
    click:(S,me,x,y)=>{ if(me!==S.p)return null; const e=D.dotsboxes.pick(S,x,y); return e>=0?e:null; }};

  /* ---------- YACHT: five dice, up to three rolls a turn holding any; score each of twelve categories once ---------- */
  const YC=['ONES','TWOS','THREES','FOURS','FIVES','SIXES','FULL HOUSE','FOUR OF A KIND','LITTLE STRAIGHT','BIG STRAIGHT','CHOICE','YACHT'], YE=[2,5,8,11,14,17,15,13,10,10,22,10];
  const yScore=(k,d)=>{ const c=[0,0,0,0,0,0,0]; d.forEach(v=>c[v]++); const s=sum(d), srt=d.slice().sort().join('');
    if(k<6)return (k+1)*c[k+1]; if(k===6)return c.includes(3)&&c.includes(2)?s:0; if(k===7){ const f=c.findIndex(x=>x>=4); return f>0?4*f:0; }
    if(k===8)return srt==='12345'?30:0; if(k===9)return srt==='23456'?30:0; if(k===10)return s; return c.includes(5)?50:0; };
  const yTot=(S,p)=>sum(S.sc[p].map(v=>Math.max(v,0)));
  const yOver=S=>{ if(S.sc.some(r=>r.includes(-1)))return null; const t=S.sc.map((_,p)=>yTot(S,p)), m=Math.max(...t), w=t.map((v,p)=>v===m?p:-1).filter(p=>p>=0); return {win:S.np===1?[0]:w,text:S.np===1?'YOU SCORE '+m+'.':w.map(p=>CN[p]).join(' AND ')+' WINS WITH '+m+'.'}; };
  const yMoves=S=>{ if(yOver(S))return []; if(!S.rl)return ['R00000']; const out=[]; if(S.rl<3){ for(let m=0;m<32;m++)out.push('R'+m.toString(2).padStart(5,'0')); for(let i=0;i<5;i++)out.push('H'+i); }
    S.sc[S.p].forEach((v,k)=>{ if(v<0)out.push('S'+k); }); return out; };
  const yRow=k=>150+k*25, yColX=(S,p)=>200+p*(310/S.np);
  D.yacht={name:'Yacht',kind:'dice',min:1,max:4,help:'Roll five dice up to three times a turn, holding any between rolls, then score them in one of the twelve boxes (a box used once). Twelve rounds; the highest total wins.',
    init:n=>({d:[0,0,0,0,0],hd:'00000',rl:0,sc:[...Array(n)].map(()=>Array(12).fill(-1)),p:0,np:n}),
    moves:yMoves,
    play:(S,m)=>{ if(m[0]==='R'){ const rnd=TG.rng(S); S.hd=m.slice(1); for(let i=0;i<5;i++)if(S.hd[i]==='0')S.d[i]=d6(rnd); S.rl++; return S; }
      if(m[0]==='H'){ const i=+m[1]; S.hd=setc(S.hd,i,S.hd[i]==='1'?'0':'1'); return S; }
      const k=+m.slice(1); S.sc[S.p][k]=yScore(k,S.d); S.rl=0; S.hd='00000'; S.p=(S.p+1)%S.np; return S; },
    over:yOver,
    ai:S=>{ if(!S.rl)return 'R00000'; const d=S.d, open=S.sc[S.p].map((v,k)=>v<0?k:-1).filter(k=>k>=0), take=()=>'S'+best(open,k=>yScore(k,d)-YE[k]);
      if(S.rl===3)return take(); for(const k of [11,9,8,6])if(open.includes(k)&&yScore(k,d)>0)return 'S'+k;
      const c=[0,0,0,0,0,0,0]; d.forEach(v=>c[v]++); let mask=null;
      if(open.includes(8)||open.includes(9))for(const run of [[2,3,4,5],[1,2,3,4],[3,4,5,6]])if(!mask&&run.every(v=>c[v])){ const u=new Set(); mask=d.map(v=>run.includes(v)&&!u.has(v)&&u.add(v)?'1':'0').join(''); }
      if(!mask){ let f=6; for(let v=6;v>=1;v--)if(c[v]>c[f])f=v; mask=d.map(v=>v===f?'1':'0').join(''); }
      return mask==='11111'?take():'R'+mask; },
    status:(S,me)=>(S.p===me||me<0?'':CN[S.p]+' ')+(!S.rl?'ROLL THE DICE.':S.rl<3?'ROLL '+S.rl+' OF 3: HOLD DICE AND ROLL, OR SCORE A BOX.':'SCORE A BOX.'),
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#2a5a3a'); const M=me===S.p?yMoves(S):[];
      S.d.forEach((v,i)=>TG.die(g,82+i*74,20,S.rl?v:0,60,{held:S.hd[i]==='1'})); if(S.rl&&S.rl<3&&me===S.p)TG.text(g,'CLICK A DIE TO HOLD IT',260,94,{s:11,c:'#c9e0c0'});
      if(M.length&&M.some(m=>m[0]==='R'))TG.btn(g,ui,'roll',200,104,120,30,S.rl?'ROLL AGAIN':'ROLL');
      g.fillStyle='rgba(251,246,234,.92)'; g.fillRect(8,138,504,374); TG.text(g,'',0,0);
      for(let p=0;p<S.np;p++){ const x=yColX(S,p); g.fillStyle=p===S.p?COL[p]+'55':'rgba(0,0,0,0)'; g.fillRect(x,138,310/S.np,374); TG.text(g,p===me?'YOU':CN[p],x+155/S.np,150-1,{b:1,s:11,c:COL[p]}); }
      YC.forEach((name,k)=>{ const y=yRow(k)+12; TG.text(g,name,16,y+12,{a:'left',s:12,c:'#3b2a1e'}); g.fillStyle='rgba(59,42,30,.2)'; g.fillRect(12,y+24,496,1);
        for(let p=0;p<S.np;p++){ const v=S.sc[p][k], x=yColX(S,p)+155/S.np; if(v>=0)TG.text(g,''+v,x,y+12,{b:1,s:14,c:'#1c1c22'}); else if(p===S.p&&S.rl&&me===S.p)TG.text(g,''+yScore(k,S.d),x,y+12,{s:13,c:'#3a8a3a'}); } });
      TG.text(g,'TOTAL',16,yRow(12)+24,{a:'left',b:1,s:12,c:'#3b2a1e'}); for(let p=0;p<S.np;p++)TG.text(g,''+yTot(S,p),yColX(S,p)+155/S.np,yRow(12)+24,{b:1,s:14,c:'#1c1c22'}); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const M=yMoves(S), b=TG.hit(ui,x,y); if(b==='roll')return has(M,'R'+S.hd)?'R'+S.hd:has(M,'R00000')?'R00000':null;
      if(y>=20&&y<80){ const i=Math.floor((x-82)/74); if(i>=0&&i<5&&x-82-i*74<60&&has(M,'H'+i))return 'H'+i; }
      const k=Math.floor((y-150-12)/25), X=yColX(S,me); if(k>=0&&k<12&&x>=X&&x<X+310/S.np&&has(M,'S'+k))return 'S'+k; return null; }};

  /* ---------- FARKLE: roll six dice, set scorers aside and roll the rest or bank; a roll with no scorer loses the turn ---------- */
  const fkScore=a=>{ if(!a.length)return -1; const c=[0,0,0,0,0,0,0]; a.forEach(v=>c[v]++);
    if(a.length===6){ if(c.slice(1).every(x=>x===1)||c.filter(x=>x===2).length===3)return 1500; if(c.filter(x=>x===3).length===2)return 2500; }
    let s=0; for(let f=1;f<=6;f++){ const n=c[f], one=f===1?100:f===5?50:0, base=f===1?1000:f*100; if(n>=3)s+=Math.max(n===3?base:n===4?1000:n===5?2000:3000,base+(n-3)*one); else if(n){ if(!one)return -1; s+=n*one; } } return s; };
  const fkAny=a=>{ const c=[0,0,0,0,0,0,0]; a.forEach(v=>c[v]++); return c[1]>0||c[5]>0||c.some(x=>x>=3)||fkScore(a)>0; };
  const fkSub=(d,m)=>d.filter((_,i)=>m>>i&1), fkBits=m=>{ let n=0; for(;m;m>>=1)n+=m&1; return n; };
  const fkOver=S=>{ if(S.np===1){ if(S.t[0]>=5000)return {win:[0],text:'5000 IN '+S.tn[0]+' TURNS: YOU WIN!'}; if(S.tn[0]>=10)return {win:[],text:'TEN TURNS UP WITH '+S.t[0]+'.'}; return null; }
    const w=S.t.findIndex(v=>v>=5000); if(w>=0)return {win:[w],text:CN[w]+' BANKS '+S.t[w]+' AND WINS.'};
    if(S.tn.every(v=>v>=25)){ const m=Math.max(...S.t), W=S.t.map((v,p)=>v===m?p:-1).filter(p=>p>=0); return {win:W,text:W.map(p=>CN[p]).join(' AND ')+' LEADS AFTER 25 TURNS.'}; } return null; };
  const fkRoll=S=>{ const rnd=TG.rng(S); S.d=[...Array(S.a)].map(()=>d6(rnd)); if(!fkAny(S.d)){ S.m='FARKLE! '+CN[S.p]+' LOSES '+S.ts+'.'; fkEnd(S); } else S.ph=1; };
  const fkEnd=S=>{ S.tn[S.p]++; S.ts=0; S.a=6; S.ph=0; S.p=(S.p+1)%S.np; };
  const fkMoves=S=>{ if(fkOver(S))return []; if(!S.ph)return ['R']; const out=[]; for(let m=1;m<1<<S.d.length;m++)if(fkScore(fkSub(S.d,m))>0)out.push([m,'R'],[m,'B']); return out; };
  D.farkle={name:'Farkle',kind:'dice',min:1,max:4,help:'Roll six dice and set aside scorers (1 = 100, 5 = 50, three of a kind = 100 x face, three ones = 1000, a straight or three pairs = 1500), then roll the rest or bank. No scorer in a roll loses the turn. First to 5000 (alone: in ten turns).',
    init:n=>({d:[],a:6,ts:0,t:Array(n).fill(0),tn:Array(n).fill(0),p:0,np:n,ph:0,m:''}),
    moves:fkMoves,
    play:(S,m)=>{ if(m==='R'){ S.m=''; fkRoll(S); return S; } const [mk,act]=m, s=fkScore(fkSub(S.d,mk)); S.ts+=s; S.a-=fkBits(mk); S.d=S.d.filter((_,i)=>!(mk>>i&1)); if(!S.a){ S.a=6; S.m='HOT DICE!'; } else S.m='';
      if(act==='B'){ S.t[S.p]+=S.ts; S.m=CN[S.p]+' BANKS '+S.ts+'.'; fkEnd(S); } else fkRoll(S); return S; },
    over:fkOver,
    ai:S=>{ if(!S.ph)return 'R'; const M=fkMoves(S).filter(m=>m[1]==='R'), [mk]=best(M,([m])=>{ const r=S.d.length-fkBits(m); return fkScore(fkSub(S.d,m))+(r?r*90:600); }), r=S.d.length-fkBits(mk)||6, ts=S.ts+fkScore(fkSub(S.d,mk));
      const bank=S.t[S.p]+ts>=5000||ts>=[0,300,300,400,700,1500,1e9][r]; return [mk,bank?'B':'R']; },
    status:S=>(S.ph?'TURN '+S.ts+' · PICK SCORERS, THEN ROLL ON OR BANK.':'ROLL '+S.a+' DICE.')+(S.m?' ('+S.m+')':''),
    draw:(g,S,me,ui,W,H)=>{ wood(g,W,H,'#2a5a3a'); const k=JSON.stringify([S.d,S.p,S.ph]); if(ui.k!==k){ ui.k=k; ui.sel=0; } const my=me===S.p&&!fkOver(S);
      TG.text(g,S.ph?'THIS ROLL':'LAST ROLL',260,24,{b:1,serif:1,s:14}); const n=S.d.length, x0=260-n*37;
      S.d.forEach((v,i)=>TG.die(g,x0+i*74+7,44,v,60,{held:S.ph&&ui.sel>>i&1,sel:S.ph&&my&&ui.sel>>i&1}));
      TG.text(g,'SET ASIDE THIS TURN: '+(6-S.a+(S.ph?0:0))+' DICE · TURN SCORE '+S.ts,260,124,{s:12});
      if(my){ if(!S.ph)TG.btn(g,ui,'roll',200,150,120,34,'ROLL '+S.a); else { const s=fkScore(fkSub(S.d,ui.sel)); TG.text(g,s>0?'SELECTED: '+s:'CLICK SCORING DICE',260,150,{s:12,c:s>0?'#ffe080':'#c9e0c0'});
        TG.btn(g,ui,'kr',110,166,140,32,'KEEP + ROLL',s>0); TG.btn(g,ui,'kb',270,166,140,32,'KEEP + BANK',s>0); } }
      g.fillStyle='rgba(251,246,234,.92)'; g.fillRect(60,220,400,40+S.np*44);
      TG.text(g,S.np===1?'GOAL 5000 IN 10 TURNS':'FIRST TO 5000',260,240,{b:1,s:13,c:'#3b2a1e'});
      for(let p=0;p<S.np;p++){ const y=280+p*44; if(p===S.p){ g.fillStyle=COL[p]+'55'; g.fillRect(64,y-18,392,38); } TG.text(g,(p===me?'YOU':CN[p]),80,y,{a:'left',b:1,s:14,c:COL[p]}); TG.text(g,''+S.t[p],300,y,{b:1,s:18,c:'#1c1c22'}); TG.text(g,'TURN '+(S.tn[p]+(p===S.p?1:0)),420,y,{s:11,c:'#3b2a1e'}); } },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const b=TG.hit(ui,x,y); if(b==='roll'&&!S.ph)return 'R'; if(!S.ph)return null;
      if((b==='kr'||b==='kb')&&fkScore(fkSub(S.d,ui.sel||0))>0)return [ui.sel,b==='kr'?'R':'B'];
      const n=S.d.length, x0=260-n*37; if(y>=44&&y<104){ const i=Math.floor((x-x0-7)/74); if(i>=0&&i<n)ui.sel=(ui.sel||0)^(1<<i); } return null; }};

  /* ---------- LIAR'S DICE: everyone hides five dice; bid how many of a face are on the table (ones are wild) or call the last bid a lie ---------- */
  const ldAlive=S=>S.dc.map((v,p)=>v?p:-1).filter(p=>p>=0), ldNext=(S,i)=>{ let j=i; do j=(j+1)%S.np; while(!S.dc[j]); return j; };
  const ldOver=S=>{ const a=ldAlive(S); return a.length===1?{win:a,text:CN[a[0]]+' IS THE LAST WITH DICE AND WINS.'}:null; };
  const ldOk=(S,q,f)=>q>=1&&f>=2&&f<=6&&q<=sum(S.dc)&&(!S.bid||q>S.bid[0]||q===S.bid[0]&&f>S.bid[1]);
  const ldMoves=S=>{ if(ldOver(S))return []; if(S.sh)return ['NEXT']; const out=[], T=sum(S.dc); for(let q=1;q<=T;q++)for(let f=2;f<=6;f++)if(ldOk(S,q,f))out.push([q,f]); if(S.bid)out.push('LIAR'); return out; };
  const ldRoll=S=>{ const rnd=TG.rng(S); S.dv=S.dc.map(n=>[...Array(n)].map(()=>d6(rnd))); };
  const ldPos=[[260,430],[70,250],[260,70],[450,250]];
  D.liarsdice={name:"Liar's Dice",kind:'dice',min:2,max:4,help:'Everyone rolls five hidden dice. In turn, raise the bid (more dice, or the same number of a higher face) on how many of a face lie on the whole table, ones counting as any face, or call LIAR. Whoever is wrong loses a die; the last with dice wins.',
    init:(n,rnd)=>{ const S={dc:Array(n).fill(5),bid:null,bp:-1,sh:0,p:0,np:n,m:''}; S.dv=S.dc.map(k=>[...Array(k)].map(()=>d6(rnd))); return S; },
    moves:ldMoves,
    play:(S,m)=>{ if(m==='NEXT'){ S.sh=0; S.bid=null; S.bp=-1; ldRoll(S); return S; }
      if(m==='LIAR'){ const [q,f]=S.bid, n=sum(S.dv.map(d=>d.filter(v=>v===f||v===1).length)), lo=n>=q?S.p:S.bp; S.dc[lo]--; S.sh=1;
        S.m='THERE WERE '+n+' '+f+'S: '+CN[lo]+' LOSES A DIE.'; S.p=S.dc[lo]?lo:ldNext(S,lo); return S; }
      S.bid=m; S.bp=S.p; S.m=CN[S.p]+' BIDS '+m[0]+' x '+m[1]+'.'; S.p=ldNext(S,S.p); return S; },
    over:ldOver,
    ai:(S,rnd)=>{ if(S.sh)return 'NEXT'; const mine=S.dv[S.p], oth=sum(S.dc)-mine.length, have=f=>mine.filter(v=>v===f||v===1).length, ex=f=>have(f)+oth/3;
      if(S.bid&&S.bid[0]>ex(S.bid[1])+.6+rnd()*.8)return 'LIAR'; let bm=null, bv=-1e9;
      for(let f=2;f<=6;f++){ let q=S.bid?(f>S.bid[1]?S.bid[0]:S.bid[0]+1):Math.max(1,Math.floor(have(f)+oth/3*.6)); if(!ldOk(S,q,f))continue; const v=ex(f)-q+rnd()*.3; if(v>bv){ bv=v; bm=[q,f]; } }
      return bm&&(bv>-1||!S.bid)?bm:S.bid?'LIAR':[1,2]; },
    status:(S,me)=>(S.sh?S.m:S.bid?'BID: '+S.bid[0]+' x '+S.bid[1]+' BY '+(S.bp===me?'YOU':CN[S.bp])+'. RAISE OR CALL LIAR.':'OPEN THE BIDDING.'),
    draw:(g,S,me,ui,W,H)=>{ TG.felt(g,W,H,'#6a2a2a'); const show=S.sh||!!ldOver(S), f=S.bid&&S.bid[1];
      for(let p=0;p<S.np;p++){ const [cx,cy]=ldPos[seatAt(p,me,S.np)], d=S.dv[p], s=p===me?44:28, w=d.length*(s+6)-6;
        TG.text(g,(p===me?'YOU':CN[p])+' · '+S.dc[p]+' DICE',cx,cy-(p===me?40:30),{b:1,s:12,c:p===S.p&&!show?'#ffd040':COL[p]});
        if(p===me||show)d.forEach((v,i)=>TG.die(g,cx-w/2+i*(s+6),cy-s/2+(p===me?0:4),v,s,{held:show&&f&&(v===f||v===1)}));
        else if(S.dc[p]){ g.fillStyle='#4a2a14'; g.beginPath(); g.moveTo(cx-34,cy+24); g.lineTo(cx+34,cy+24); g.lineTo(cx+24,cy-16); g.lineTo(cx-24,cy-16); g.closePath(); g.fill(); g.fillStyle='#7a4a24'; g.fillRect(cx-36,cy+20,72,8); } }
      g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(150,200,220,110);
      if(S.bid){ TG.text(g,'BID BY '+(S.bp===me?'YOU':CN[S.bp]),260,218,{s:12}); TG.text(g,S.bid[0]+' x',236,262,{b:1,s:30}); TG.die(g,276,240,S.bid[1],40); } else TG.text(g,'NO BID YET',260,255,{s:14});
      if(S.sh)TG.text(g,S.m,260,296,{s:11,c:'#ffe080'});
      if(me!==S.p||ldOver(S))return; if(S.sh){ TG.btn(g,ui,'next',200,330,120,32,'NEXT ROUND'); return; }
      const k=JSON.stringify(S.bid); if(ui.k!==k){ ui.k=k; ui.q=S.bid?S.bid[0]:1; ui.f=S.bid?S.bid[1]+1:2; if(ui.f>6){ ui.f=2; ui.q++; } }
      TG.btn(g,ui,'q-',60,330,34,32,'-'); TG.text(g,''+ui.q,114,346,{b:1,s:20}); TG.btn(g,ui,'q+',134,330,34,32,'+'); TG.btn(g,ui,'f-',184,330,34,32,'-'); TG.die(g,224,330,ui.f,32); TG.btn(g,ui,'f+',262,330,34,32,'+');
      TG.btn(g,ui,'bid',306,330,74,32,'BID',ldOk(S,ui.q,ui.f)); TG.btn(g,ui,'liar',388,330,80,32,'LIAR!',!!S.bid); },
    click:(S,me,x,y,ui)=>{ if(me!==S.p)return null; const b=TG.hit(ui,x,y); if(!b)return null; if(b==='next')return S.sh?'NEXT':null; if(b==='liar')return S.bid&&!S.sh?'LIAR':null;
      const T=sum(S.dc); if(b==='q-')ui.q=Math.max(1,ui.q-1); if(b==='q+')ui.q=Math.min(T,ui.q+1); if(b==='f-')ui.f=Math.max(2,ui.f-1); if(b==='f+')ui.f=Math.min(6,ui.f+1);
      return b==='bid'&&!S.sh&&ldOk(S,ui.q,ui.f)?[ui.q,ui.f]:null; }};
  return D; });
