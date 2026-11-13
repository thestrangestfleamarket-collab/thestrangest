// THE BOOKSTORE CAFÉ'S GAME TABLES: five tables of four seats; sit, pick a public-domain game (board, cards, dice; TG, the rules in 144cd–144cg), play other players or the computer, for fun. A table's game is shared through the online world store (key tbl:books:<n>); off the website it plays in the page.
import {THREE} from './003-shx.js';
import {INV, INVITES, ONLINE, ROOMS, st, TABLES, USE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {STORE, SYS} from './006-map-pre.js';
import {MINI} from './038zd-mini.js';
import {MSHOP} from './059i-mshops.js';
const TG={lib:[],G:null};
{ /* ---------- helpers every game uses: a seeded random in the state, cards, dice, buttons ---------- */
  TG.rng=S=>()=>{ let t=(S.r=(S.r+0x6D2B79F5)>>>0); t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; };
  TG.clone=o=>JSON.parse(JSON.stringify(o));
  TG.shuffle=(a,rnd)=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  TG.deck=(rnd,n=52)=>TG.shuffle([...Array(n).keys()],rnd);
  // a card is 0..51: rank c%13 (0 is a two, 12 an ace), suit floor(c/13) (clubs, diamonds, hearts, spades)
  TG.rank=c=>c%13; TG.suit=c=>Math.floor(c/13); TG.RANKS='23456789TJQKA'; TG.SUITS='♣♦♥♠';
  TG.cardName=c=>(c%13===8?'10':TG.RANKS[c%13])+TG.SUITS[Math.floor(c/13)];
  TG.CW=44; TG.CH=62;
  TG.card=(g,x,y,c,up=true,o={})=>{ const w=o.w||TG.CW, h=o.h||TG.CH; g.save();
    if(o.sel){ y-=8; } g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(x+2,y+2,w,h);
    if(!up||c==null||c<0){ g.fillStyle='#7a2430'; g.fillRect(x,y,w,h); g.strokeStyle='#f1e6c8'; g.lineWidth=2; g.strokeRect(x+3,y+3,w-6,h-6); g.fillStyle='#a0404c'; for(let i=6;i<w-6;i+=6)for(let j=6;j<h-6;j+=6)if((i+j)%12===0)g.fillRect(x+i,y+j,3,3); g.restore(); return; }
    g.fillStyle=o.dim?'#c9c2b0':'#fbf6ea'; g.fillRect(x,y,w,h); g.strokeStyle=o.sel?'#e0a020':'#3b2a1e'; g.lineWidth=o.sel?3:1; g.strokeRect(x+.5,y+.5,w-1,h-1);
    const s=Math.floor(c/13), r=c%13, red=s===1||s===2; g.fillStyle=red?'#c0242c':'#1c1c22'; g.textAlign='left'; g.textBaseline='top';
    g.font=`bold ${Math.round(w*.32)}px Georgia,serif`; g.fillText(r===8?'10':TG.RANKS[r],x+3,y+2); g.font=`${Math.round(w*.3)}px Georgia,serif`; g.fillText(TG.SUITS[s],x+3,y+2+w*.32);
    g.textAlign='center'; g.textBaseline='middle'; g.font=`${Math.round(w*.55)}px Georgia,serif`; g.fillText(TG.SUITS[s],x+w/2,y+h*.6); g.restore(); };
  TG.die=(g,x,y,v,s=34,o={})=>{ g.save(); g.fillStyle=o.held?'#f0d070':'#fbf6ea'; g.fillRect(x,y,s,s); g.strokeStyle=o.sel?'#e0a020':'#3b2a1e'; g.lineWidth=o.sel?3:1.5; g.strokeRect(x+.5,y+.5,s-1,s-1);
    if(v>0){ g.fillStyle='#1c1c22'; const P={1:[[1,1]],2:[[0,0],[2,2]],3:[[0,0],[1,1],[2,2]],4:[[0,0],[2,0],[0,2],[2,2]],5:[[0,0],[2,0],[1,1],[0,2],[2,2]],6:[[0,0],[2,0],[0,1],[2,1],[0,2],[2,2]]}[v]||[];
      for(const [i,j] of P){ g.beginPath(); g.arc(x+s*(.25+i*.25),y+s*(.25+j*.25),s*.08,0,7); g.fill(); } } g.restore(); };
  // a button: drawn and remembered for this frame (ui.btns), so click() finds it with TG.hit(ui,x,y)
  TG.btn=(g,ui,id,x,y,w,h,label,on=true)=>{ g.save(); g.fillStyle=on?'#ece5d3':'#8a8478'; g.fillRect(x,y,w,h); g.strokeStyle='#3b2a1e'; g.lineWidth=2; g.strokeRect(x+1,y+1,w-2,h-2);
    g.fillStyle=on?'#3b2a1e':'#4a4438'; let fs=Math.min(14,h*.5); g.font=`${fs}px monospace`; const tw=g.measureText(label).width; if(tw>w-8){ fs*=(w-8)/tw; g.font=`${fs}px monospace`; } g.textAlign='center'; g.textBaseline='middle'; g.fillText(label,x+w/2,y+h/2+1); g.restore(); if(on)(ui.btns||(ui.btns={}))[id]=[x,y,w,h]; };
  TG.hit=(ui,x,y)=>{ for(const id in ui.btns||{}){ const [bx,by,bw,bh]=ui.btns[id]; if(x>=bx&&x<bx+bw&&y>=by&&y<by+bh)return id; } return null; };
  TG.text=(g,t,x,y,o={})=>{ g.save(); g.fillStyle=o.c||'#f1e6c8'; g.font=`${o.b?'bold ':''}${o.s||13}px ${o.serif?'Georgia,serif':'monospace'}`; g.textAlign=o.a||'center'; g.textBaseline='middle'; g.fillText(t,x,y); g.restore(); };
  TG.felt=(g,W,H,c='#1f5a3a')=>{ g.fillStyle=c; g.fillRect(0,0,W,H); g.fillStyle='rgba(255,255,255,.03)'; for(let i=0;i<W;i+=4)for(let j=(i/4)%2*2;j<H;j+=4)g.fillRect(i,j,1,1); };
  TG.eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  // the computer's move: the game's own, else the best by its score one move ahead, else any legal move
  TG.ai=(G,S)=>{ const rnd=TG.rng({r:(S.r^0x5bd1e995)>>>0||7}), M=G.moves(S); if(!M.length)return null; if(G.ai){ const m=G.ai(TG.clone(S),rnd); if(m!=null)return m; }
    if(G.score){ let best=null, bv=-1e18; for(const m of M.slice(0,400)){ const v=G.score(G.play(TG.clone(S),m),S.p)+rnd()*.01; if(v>bv){ bv=v; best=m; } } return best; }
    return M[Math.floor(rnd()*M.length)]; };
  TG.games=()=>{ if(!TG.G){ TG.G={}; for(const f of TG.lib)Object.assign(TG.G,f()); } return TG.G; };
}

{ const say=t=>SAY(t,'#e8d6a8'), N=5, W=520, BH=520, TOP=58, H=TOP+BH+30, ALONE='me';
  const T=[...Array(N)].map(()=>({g:'',s:['','','',''],P:null,st:null,v:0,t:0})), TOPS=[];
  const key=n=>'tbl:books:'+n, me=()=>(ONLINE.on&&ONLINE.me)||ALONE, online=()=>!!(ONLINE.on&&ONLINE.put);
  const nameOf=id=>{ if(id==='cpu')return 'COMPUTER'; if(id===me())return 'YOU'; const o=ONLINE.others&&ONLINE.others.get(id); return (o&&o.name)||'A PLAYER'; };
  const here=id=>id===me()||id==='cpu'||!!(ONLINE.others&&ONLINE.others.has(id));
  // the players are the filled seats in order, fixed at START (R.P); S.p is a player, P[S.p] its seat. Sitting in a computer's seat mid-game takes it over; an empty one watches.
  const players=R=>R.st&&R.P?R.P:R.s.map((id,i)=>id?i:-1).filter(i=>i>=0);
  const publish=(n,R)=>{ R.v++; R.t=Date.now(); paintTop(n); if(online())ONLINE.put(key(n),JSON.stringify(R)); };
  const fromWorld=(n,v)=>{ let R; try{ R=JSON.parse(v); }catch(e){ return; } if(!R||!Array.isArray(R.s))return; const L=T[n]; if(R.v<L.v&&Date.now()-L.t<4000)return; Object.assign(L,R); paintTop(n); };
  SYS.add('world',(k,v)=>{ if(typeof k==='string'&&k.startsWith('tbl:books:')){ const n=+k.slice(10); if(n>=0&&n<N)fromWorld(n,v); } },'144cc-tables');
  // the host (the first seated player here) moves for the computer and for anyone who has gone
  const host=R=>R.s.find(id=>id&&id!=='cpu'&&here(id))===me();
  let cpuAt=0;
  SYS.add('places',()=>{ if(!TG.G)return; const now=performance.now(); if(now<cpuAt)return; cpuAt=now+350;
    T.forEach((R,n)=>{ const G=TG.G[R.g]; if(!G||!R.st||!host(R))return; if(G.over(R.st))return; const P=players(R), seat=P[R.st.p], id=R.s[seat];
      if(id==='cpu'||!here(id)&&Date.now()-R.t>15000){ if(R.wait==null){ R.wait=now+(G.kind==='cards'?900:700); return; } if(now<R.wait)return; R.wait=null; const m=TG.ai(G,R.st); if(m==null)return; R.st=G.play(TG.clone(R.st),m); publish(n,R); } }); },'144cc-cpu');

  /* ---------- the table's top in 3D: the game as it stands, painted on a board on the table ---------- */
  const paintTop=n=>{ const o=TOPS[n]; if(!o||!o.parent)return; const R=T[n], G=TG.G&&TG.G[R.g], g=o.userData.g, c=g.canvas; g.setTransform(1,0,0,1,0,0);
    if(!G||!R.st){ g.fillStyle='#6a4426'; g.fillRect(0,0,c.width,c.height); g.fillStyle='#e8d6a8'; g.font='bold 22px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(G?G.name.toUpperCase():'TABLE '+(n+1),c.width/2,c.height/2); }
    else{ g.save(); g.scale(c.width/W,c.height/BH); try{ G.draw(g,R.st,-1,{btns:{}},W,BH); }catch(e){} g.restore(); }
    o.material.map.needsUpdate=true; };
  TABLES.top=(n,size)=>{ '@tables'; const cv=document.createElement('canvas'); cv.width=cv.height=256; const tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace;
    const me_=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshLambertMaterial({map:tex})); me_.rotation.x=-Math.PI/2; me_.userData.g=cv.getContext('2d'); TOPS[n]=me_; TG.games(); setTimeout(()=>paintTop(n),0); return me_; };
  TABLES.label=n=>{ const R=T[n], G=TG.G&&TG.G[R.g]; return 'TABLE '+(n+1)+(G?': '+G.name.toUpperCase():'')+(G&&R.st&&!G.over(R.st)?' · PLAYING':'')+' · SIT'; };

  /* ---------- sitting and leaving ---------- */
  let at=null;   // [table, seat] you sit at
  TABLES.sit=(n,seat)=>{ '@tables'; TG.games(); const R=T[n]; if(R.s[seat]&&R.s[seat]!==me()&&here(R.s[seat])&&R.s[seat]!=='cpu'){ say('SOMEONE IS SITTING THERE.'); return; }
    if(at&&(at[0]!==n||at[1]!==seat))TABLES.leave();
    at=[n,seat]; if(R.s[seat]!==me()){ R.s[seat]=me(); publish(n,R); } open(); };
  TABLES.leave=()=>{ if(!at)return; const [n,seat]=at, R=T[n]; at=null; if(R.s[seat]===me()){ const G=TG.G&&TG.G[R.g], live=G&&R.st&&!G.over(R.st); R.s[seat]=live&&players(R).includes(seat)?'cpu':''; if(!R.s.some(id=>id&&id!=='cpu')){ R.s=['','','','']; R.st=null; R.P=null; } publish(n,R); } setTimeout(()=>{ if(MINI.on&&MINI.on.tbl)MINI.close(); },0); };   // (not from inside the window's own tick)
  SYS.add('places',()=>{ if(!at)return; if(ROOMS.offIn&&ROOMS.offIn()!=='books'||!st.sit)TABLES.leave(); },'144cc-leave');

  /* ---------- the window: the seats along the top, then the lobby (pick a game) or the game ---------- */
  const open=()=>MINI.open({tbl:true,title:'THE CAFÉ · TABLE '+(at[0]+1),w:W,h:H,help:'Pick a game, fill the empty seats with the computer or wait for players, then START. You play for fun.',
    start:S=>{ S.ui={btns:{}}; S.sys={}; },
    tick:S=>{ if(!at){ S.over='YOU GOT UP.'; return; } const R=T[at[0]], G=TG.G[R.g]; S.line=lineOf(R,G); if(!S.press)return; const x=S.mx, y=S.my, b=TG.hit({btns:S.sys},x,y);
      if(b)return press(R,G,b);
      if(G&&R.st&&y>=TOP&&y<TOP+BH&&!G.over(R.st)){ const P=players(R), mine=P.indexOf(at[1]); if(mine<0)return; const m=G.click(R.st,mine,x,y-TOP,S.ui);
        if(m!=null){ if(R.st.p!==mine){ say('NOT YOUR TURN.'); return; } if(!G.moves(R.st).some(q=>TG.eq(q,m)))return; R.st=G.play(TG.clone(R.st),m); S.ui.sel=null; publish(at[0],R); } } },
    draw:(S,g)=>{ if(!at)return; const R=T[at[0]], G=TG.G[R.g], sys={}, P=players(R); g.fillStyle='#2a1c12'; g.fillRect(0,0,W,H);
      // the seats: yours green, the one to play gold; an empty or computer seat (between games) is clicked to switch it
      for(let i=0;i<4;i++){ const x=6+i*128, id=R.s[i], mine=i===at[1], turn=G&&R.st&&!G.over(R.st)&&P[R.st.p]===i;
        g.fillStyle=turn?'#e0a020':mine?'#5a7a5a':'#3b2a1e'; g.fillRect(x,6,124,44); g.fillStyle='#f1e6c8'; g.font='11px monospace'; g.textAlign='center'; g.textBaseline='middle';
        g.fillText('SEAT '+(i+1)+(turn?' · TURN':''),x+62,18); g.font='bold 12px monospace'; g.fillText(id?nameOf(id):'EMPTY',x+62,36);
        if(!mine&&(!id||id==='cpu')&&(!R.st||!G||G.over(R.st)))sys['seat'+i]=[x,6,124,44]; }
      const u=S.ui; u.btns={}; u.mx=S.mx; u.my=S.my-TOP; g.save(); g.translate(0,TOP); g.beginPath(); g.rect(0,0,W,BH); g.clip();
      if(!G||!R.st){ lobby(g,R,G,u); for(const k in u.btns){ const r=u.btns[k]; sys[k]=[r[0],r[1]+TOP,r[2],r[3]]; } u.btns={}; }
      else G.draw(g,R.st,P.indexOf(at[1]),u,W,BH);
      g.restore(); const f={btns:{}};
      if(G&&R.st)TG.btn(g,f,'new',W-130,TOP+BH+3,124,24,G.over(R.st)?'NEW GAME':'END GAME'); TG.btn(g,f,'up',6,TOP+BH+3,124,24,'GET UP'); S.sys=Object.assign(sys,f.btns); } });
  const lineOf=(R,G)=>{ if(!G)return 'PICK A GAME.'; if(!R.st)return G.name.toUpperCase()+': '+G.help; const o=G.over(R.st); if(o)return o.text||'GAME OVER.'; const P=players(R), id=R.s[P[R.st.p]]; return (id===me()&&P[R.st.p]===at[1]?'YOUR TURN.':nameOf(id)+' TO PLAY.')+(G.status?' '+G.status(R.st,P.indexOf(at[1])):''); };
  const press=(R,G,b)=>{ const n=at[0];
    if(b==='up'){ TABLES.leave(); if(USE.stand)USE.stand(); return; }
    if(b==='new'){ R.st=null; R.P=null; R.g=''; for(let i=0;i<4;i++)if(R.s[i]==='cpu')R.s[i]=''; publish(n,R); return; }
    if(b.startsWith('seat')){ const i=+b.slice(4); R.s[i]=R.s[i]==='cpu'?'':'cpu'; publish(n,R); return; }
    if(b.startsWith('g:')){ R.g=b.slice(2); R.st=null; R.P=null; const G2=TG.G[R.g]; let f=R.s.filter(Boolean).length; for(let i=0;i<4&&f>G2.max;i++)if(R.s[i]==='cpu'){ R.s[i]=''; f--; } for(let i=0;i<4&&f<G2.min;i++)if(!R.s[i]){ R.s[i]='cpu'; f++; } publish(n,R); return; }
    if(b==='back'){ R.g=''; pick=false; publish(n,R); return; }
    if(b==='inv'){ pick=!pick; if(pick&&!INVITES.everyone().length)say('NO ONE ELSE IS ONLINE RIGHT NOW.'); return; }
    if(b.startsWith('p:')&&G){ const p=INVITES.everyone().find(q=>q.id===b.slice(2)); if(p&&INVITES.send(p.id,p.name,'books',{n,g:R.g}))pick=false; return; }
    if(b==='start'&&G){ pick=false; const P=players(R); if(P.length<G.min||P.length>G.max)return; const st0={r:(Math.random()*4294967296)>>>0}; R.st=G.init(P.length,TG.rng(st0)); if(R.st.r==null)R.st.r=st0.r; R.P=P; publish(n,R); } };
  const KINDS=[['board','BOARD GAMES'],['cards','CARDS'],['dice','DICE']];
  const lobby=(g,R,G,u)=>{ const L=Object.entries(TG.G);
    if(!G){ let y=12; for(const [k,label] of KINDS){ const rows=L.filter(([,q])=>q.kind===k); if(!rows.length)continue; TG.text(g,label,W/2,y+6,{b:1,serif:1,s:14}); y+=20;
        rows.forEach(([id,q],i)=>{ const c=i%3, x=8+c*170, yy=y+Math.floor(i/3)*28; TG.btn(g,u,'g:'+id,x,yy,164,24,q.name.toUpperCase()+' '+(q.min===q.max?q.min:q.min+'-'+q.max)); }); y+=Math.ceil(rows.length/3)*28+8; } return; }
    const P=players(R), can=G.max>=2&&open1(R)>=0;   // only a game for two or more is played with an invited player
    if(pick&&can){ const L=INVITES.everyone().slice(0,24); TG.text(g,'INVITE A PLAYER TO '+G.name.toUpperCase(),W/2,24,{b:1,serif:1,s:16}); TG.text(g,L.length?'THEY GET A CARD AND A MARK ON THEIR MAP.':'NO ONE ELSE IS ONLINE RIGHT NOW.',W/2,46,{s:11,c:'#c9b890'});
      L.forEach((q,i)=>{ const x=8+(i%3)*170, y=64+Math.floor(i/3)*30; TG.btn(g,u,'p:'+q.id,x,y,164,26,q.name.toUpperCase().slice(0,16)+(q.sec&&q.sec!==ONLINE.room?' ('+q.sec.slice(2).toUpperCase()+')':'')); });
      TG.btn(g,u,'inv',W/2-90,BH-46,180,28,'BACK'); return; }
    TG.text(g,G.name.toUpperCase(),W/2,60,{b:1,serif:1,s:26}); TG.text(g,(G.min===G.max?G.min:G.min+' TO '+G.max)+' PLAYERS',W/2,92,{s:13});
    const words=G.help.split(' '); let line='', y=130; for(const w of words){ if((line+' '+w).length>58){ TG.text(g,line,W/2,y,{s:12}); y+=18; line=w; } else line=(line?line+' ':'')+w; } TG.text(g,line,W/2,y,{s:12});
    TG.text(g,'CLICK AN EMPTY SEAT ABOVE FOR THE COMPUTER; LEAVE IT EMPTY FOR A PLAYER.',W/2,BH-120,{s:11,c:'#c9b890'});
    const ok=P.length>=G.min&&P.length<=G.max; TG.btn(g,u,'start',W/2-90,BH-90,180,36,ok?'START':P.length<G.min?'NEEDS '+G.min:'AT MOST '+G.max,ok); TG.btn(g,u,'back',W/2-90,BH-46,180,28,'OTHER GAMES'); if(can&&ONLINE.on)TG.btn(g,u,'inv',W/2-90,BH-160,180,30,'INVITE A PLAYER'); };
  // a seat an invited player can take: an empty one, else one the computer holds
  const open1=R=>{ const i=R.s.findIndex(id=>!id); return i>=0?i:R.s.findIndex(id=>id==='cpu'); };
  let pick=false;
  INVITES.kinds.books={what:d=>{ const G=TG.games()[d.g]; return 'TO PLAY '+(G?G.name.toUpperCase():'A GAME')+' AT THE BOOKSTORE CAFÉ (TABLE '+((+d.n||0)+1)+')'; },
    where:()=>{ const a=MSHOP.at&&MSHOP.at.books; return a&&a.door?{x:a.door[0],z:a.door[1],name:'THE BOOKSTORE'}:null; },
    // accepting: into the bookstore, then sat in a free seat at that table
    go:async d=>{ const n=Math.max(0,Math.min(N-1,Math.floor(+d.n||0))); if(ROOMS.offIn&&ROOMS.offIn()!=='books'){ if(STORE.ensure)await STORE.ensure(); await ROOMS.enter('books'); }
      for(let i=0;i<40&&!TABLES.chairs[n*4];i++)await new Promise(r=>setTimeout(r,250)); const R=T[n], k=R.s.findIndex(id=>id===me())>=0?R.s.indexOf(me()):open1(R), f=TABLES.chairs[n*4+k];
      if(k<0||!f){ say('TABLE '+(n+1)+' IS FULL.'); return; } f(); }};
  /* ---------- the coffee bar (pay at the bar, take it with you) and the game cupboard (every game, its players and rules) ---------- */
  const MENU=[['d_coffee','A COFFEE',1],['f_croissant','A CROISSANT',2],['f_cake','A SLICE OF CAKE',3]];
  TABLES.bar=()=>{ '@tables'; MINI.open({title:'THE COFFEE BAR',w:400,h:230,help:'Click to buy. Pay at the bar; it goes in your bag.',
    tick:S=>{ if(!S.press)return; const i=Math.floor((S.my-46)/48); if(i<0||i>=MENU.length||S.mx<20||S.mx>380)return; const [id,nm,c]=MENU[i]; if(!INV.afford(c)){ S.line='THAT IS $'+c+'. YOU HAVE $'+INV.money()+'.'; return; } INV.pay(c); INV.add(id,1); S.line=nm+'. ENJOY.'; },
    draw:(S,g)=>{ g.fillStyle='#1c2420'; g.fillRect(0,0,400,230); TG.text(g,'TODAY',200,24,{serif:1,b:1,s:18}); MENU.forEach(([,nm,c],i)=>{ const y=46+i*48, on=S.my>y&&S.my<y+44&&S.mx>20&&S.mx<380; g.fillStyle=on?'#3a4a40':'#28302c'; g.fillRect(20,y,360,44); TG.text(g,nm,36,y+22,{a:'left',s:15}); TG.text(g,'$'+c,364,y+22,{a:'right',s:15,c:'#f0c060'}); }); TG.text(g,'YOU HAVE $'+INV.cash,200,214,{s:12,c:'#c9b890'}); }}); };
  TABLES.list=()=>{ '@tables'; const L=Object.values(TG.games()); MINI.open({title:'THE GAME CUPBOARD',w:520,h:560,help:'Sit at any table to play. Every game is free to play here.',
    draw:(S,g)=>{ g.fillStyle='#2a1c12'; g.fillRect(0,0,520,560); let y=18; for(const [k,label] of KINDS){ const rows=L.filter(q=>q.kind===k); if(!rows.length)continue; TG.text(g,label,260,y,{serif:1,b:1,s:15}); y+=20;
      rows.forEach((q,i)=>{ TG.text(g,q.name.toUpperCase()+' · '+(q.min===q.max?q.min:q.min+'-'+q.max),14+(i%2)*256,y+Math.floor(i/2)*18,{a:'left',s:12}); }); y+=Math.ceil(rows.length/2)*18+12; } }}); };
  // the shared state of the five tables, for the tests
  TABLES.state=()=>T; TABLES.at=()=>at;
}
window.TG=TG;
export {TG};
