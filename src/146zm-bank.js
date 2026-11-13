// THE BANK'S TELLER HALL: two teller cages at the front, one kept by THE RAT; an account at either cage that keeps your cash on the server; where the bank's staff and its customers go. The dragon's hoard stays behind them.
import {INV, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {STORE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
const BANKK={}; window.BANKK=BANKK;
{ const say=(t,c)=>SAY(t,c||'#f2c14e');
  // the account: its balance, kept like your cash (OWNED: on the server when you play on the website)
  const read=()=>{ try{ const v=OWNED.get('bank'); const o=typeof v==='string'?JSON.parse(v):v; return o&&o.v===1?o:{v:1,bal:0}; }catch(e){ return {v:1,bal:0}; } };
  const write=o=>{ try{ OWNED.set('bank',JSON.stringify(o)); }catch(e){} };
  BANKK.account=()=>read();
  INV.bank={bal:()=>read().bal,take:n=>{ const o=read(), m=Math.min(Math.max(0,Math.trunc(n)),o.bal); o.bal-=m; write(o); return m; }};   // what a shop takes when you carry too little
  BANKK.move=n=>{ '@later'; const o=BANKK.account(); n=Math.trunc(n); if(n>0){ n=Math.min(n,INV.cash); if(!n)return 'YOU HAVE NO CASH ON YOU.'; INV.cash-=n; o.bal+=n; } else if(n<0){ const m=Math.min(-n,o.bal); if(!m)return 'THE ACCOUNT IS EMPTY.'; o.bal-=m; INV.cash+=m; n=-m; }
    write(o); if(INV.save)INV.save(); return ''; };
  // the cage's window: your cash, the balance, buttons to put in and take out
  const B=[['IN $10',10],['IN $100',100],['IN ALL',1e12],['OUT $10',-10],['OUT $100',-100],['OUT ALL',-1e12]];
  BANKK.open=who=>MINI.open({title:'THE BANK · '+(who||'THE CAGE'),w:380,h:300,help:'Money in the account is kept for you.',
    start:S=>{ S.o=BANKK.account(); },
    tick:S=>{ if(!S.press)return; const i=B.findIndex((b,k)=>{ const x=20+(k%3)*118, y=150+Math.floor(k/3)*60; return S.mx>x&&S.mx<x+108&&S.my>y&&S.my<y+46; }); if(i<0)return; const no=BANKK.move(B[i][1]); S.o=BANKK.account(); S.line=no||(B[i][1]>0?'DEPOSITED.':'WITHDRAWN.'); },
    draw:(S,g)=>{ g.fillStyle='#1a1612'; g.fillRect(0,0,380,300); g.textAlign='left'; g.textBaseline='top'; g.font='13px monospace'; g.fillStyle='#c8b080'; g.fillText('ON YOU',20,24); g.fillText('IN THE ACCOUNT',20,70); g.font='bold 22px monospace'; g.fillStyle='#f4ecd8'; g.fillText('$'+INV.cash.toLocaleString(),20,40); g.fillStyle='#f0c040'; g.fillText('$'+S.o.bal.toLocaleString(),20,86);
      B.forEach(([t],k)=>{ const x=20+(k%3)*118, y=150+Math.floor(k/3)*60; g.fillStyle=k<3?'#2a5a3a':'#5a3a24'; g.fillRect(x,y,108,46); g.fillStyle='#f4ecd8'; g.font='12px monospace'; g.textAlign='center'; g.fillText(t,x+54,y+16); g.textAlign='left'; }); }});
  // where its people go: the rat and the teller in their cages, the guard by the door, the clerk at the side, the manager behind the cages; customers queue at the cages
  const frameOf=S=>IKIT.frame({x0:S.B.x0,y0:S.B.y0,x1:S.B.x1,y1:S.B.y1});
  { const S=STORE.bank, R=(STORE.rooms||[]).find(r=>r.id==='bank'); if(S&&S.B&&R){ const F=frameOf(S), TM=F.W/(S.B.x1-S.B.x0), mx=(S.B.x1-S.B.x0)/2, Dp=S.B.y1-S.B.y0, sp=(x,y,du,dv)=>{ const p=F.pw(x*TM,y*TM); return {x:p[0],z:p[1],hd:F.hd(du,dv)}; };
    R.spots={CAGES:sp(mx-3.5,Dp-3.1,0,1),TELLER:sp(mx+3.5,Dp-3.1,0,1),GUARD:sp(mx+2.4,Dp-1.0,0,-1),CLERK:sp(mx-6.5,Dp-1.6,1,0),MANAGER:sp(mx+1.5,Dp-6,0,1)};
    R.seats=BANKK.places=[sp(mx-3.5,Dp-1.5,0,-1),sp(mx-3.5,Dp-.7,0,-1),sp(mx+3.5,Dp-1.5,0,-1),sp(mx+3.5,Dp-.7,0,-1)]; } }
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.bank=S=>{ '@later'; const F=frameOf(S), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,glow,pic,words,use}=K, TM=F.W/(S.B.x1-S.B.x0), mx=(S.B.x1-S.B.x0)/2*TM, Dp=(S.B.y1-S.B.y0)*TM, C={wood:0x4a2e1c,brass:0xb08838,marble:0xd8d0c0,dark:0x1a1612};
    // the two cages: a marble-topped counter, a brass grille up to the ceiling's height of a man, a little window, a sign over each
    for(const [s,who] of [[-1,'THE RAT'],[1,'THE TELLER']]){ const c=mx+s*3.5*TM, v=Dp-2.4*TM, u0=c-.9*TM, u1=c+.9*TM; box(u0,v-.25,u1,v+.25,0,1.0,C.wood); box(u0-.03,v-.28,u1+.03,v+.28,1.0,1.05,C.marble); K.sol(u0,v-.25,u1,v+.25);
      for(let i=0;i<=12;i++){ const u=u0+i*(u1-u0)/12; if(Math.abs(u-c)<.22)continue; box(u-.012,v-.01,u+.012,v+.01,1.05,2.1,C.brass); } box(u0,v-.02,u1,v+.02,2.08,2.14,C.brass); box(u0,v-.02,u1,v+.02,1.5,1.53,C.brass);
      pic(c,v+.03,2.2,1.2,.3,0,1,words(64,16,'#1a1612',[[s<0?'CAGE ONE':'CAGE TWO',32,4,'#f0c040',9,'center']]),true);
      use((s<0?'CAGE ONE':'CAGE TWO')+' (YOUR ACCOUNT)',c,v+.4,1.6,1.4,()=>BANKK.open(who),1.8); }
    K.flush(); setTimeout(()=>WORKERS.make('bank'),0); };
}
export {BANKK};
