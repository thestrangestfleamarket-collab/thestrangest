// THE GAMES: the insides' small games for the minigames' window (MINI): darts (301 on a real board), pool (rack, cue ball, pockets), skee-ball (aim, power, the rings), the claw machine (steer, drop, grab, the chute), air hockey (against the house), a shift at the pass (plates to the tables, for tips), soldering a repair, waxing a deck, cutting a gem. Each GAMES.x(opts) gives a game; opts.end(S) gets the result.
const GAMES={}; window.GAMES=GAMES;
{ const PI=Math.PI, rnd=Math.random, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), font=(g,s,c,al='center')=>{ g.font=s+'px monospace'; g.fillStyle=c; g.textAlign=al; g.textBaseline='middle'; };
  /* ---------- DARTS: 301, three darts a turn; the aim sways, you click to throw ---------- */
  const SEG=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  GAMES.dartScore=(x,y)=>{ const r=Math.hypot(x,y); if(r<.0064)return [50,'BULL']; if(r<.016)return [25,'25']; if(r>.17)return [0,'MISS']; const a=(Math.atan2(x,y)*180/PI+360+9)%360, n=SEG[Math.floor(a/18)];
    return r>.099&&r<.107?[n*3,'T'+n]:r>.162?[n*2,'D'+n]:[n,''+n]; };
  GAMES.darts=(o={})=>({title:'DARTS: 301',w:400,h:440,again:true,help:'Move to aim (it sways), click to throw. Three darts a turn; from 301 to exactly 0. Going under is a bust.',
    start:S=>{ S.left=301; S.turn=1; S.darts=[]; S.inT=0; S.tsum=0; S.log=[]; },
    tick:(S,dt)=>{ S.t+=dt; const sw=14+6*Math.sin(S.t*.7); S.ax=S.mx+Math.sin(S.t*1.9)*sw+Math.sin(S.t*3.7)*sw*.4; S.ay=S.my+Math.cos(S.t*1.6)*sw+Math.sin(S.t*4.3)*sw*.3;
      if(S.press){ const x=S.ax+(rnd()-.5)*8, y=S.ay+(rnd()-.5)*8, [s,lab]=GAMES.dartScore((x-200)/170*.17,-(y-210)/170*.17); S.darts.push([x,y]); S.inT++; S.tsum+=s; S.log.push(lab);
        if(S.left-S.tsum<0){ S.line=`BUST (${S.log.join(' · ')}). BACK TO ${S.left}.`; S.inT=3; S.tsum=0; }
        else if(S.left-S.tsum===0){ S.left=0; S.score=S.turn; S.over=`OUT IN ${S.turn} TURN${S.turn>1?'S':''}! (${S.log.join(' · ')})`; return; }
        else S.line=`TURN ${S.turn}: ${S.log.join(' · ')} · ${S.left-S.tsum} LEFT`;
        if(S.inT>=3){ S.left-=S.tsum; S.tsum=0; S.inT=0; S.turn++; S.log=[]; setTimeout(()=>{ if(S.darts)S.darts.length=0; },700); if(S.turn>15){ S.over=`OUT OF TURNS WITH ${S.left} LEFT.`; S.score=99; } } } },
    draw:(S,g)=>{ g.fillStyle='#2a1a12'; g.fillRect(0,0,400,440); const cx=200, cy=210, R=170;
      g.fillStyle='#111'; g.beginPath(); g.arc(cx,cy,R+18,0,7); g.fill();
      const ring=(r0,r1,c0,c1)=>{ for(let i=0;i<20;i++){ const a0=(i*18-9-90)*PI/180, a1=a0+18*PI/180; g.fillStyle=i%2?c1:c0; g.beginPath(); g.arc(cx,cy,r1,a0,a1); g.arc(cx,cy,r0,a1,a0,true); g.fill(); } };
      const k=R/.17; ring(.016*k,.099*k,'#e8dcb8','#1a1a1a'); ring(.099*k,.107*k,'#c03028','#2a8a40'); ring(.107*k,.162*k,'#e8dcb8','#1a1a1a'); ring(.162*k,.17*k,'#c03028','#2a8a40');
      g.fillStyle='#2a8a40'; g.beginPath(); g.arc(cx,cy,.016*k,0,7); g.fill(); g.fillStyle='#c03028'; g.beginPath(); g.arc(cx,cy,.0064*k,0,7); g.fill();
      font(g,13,'#e8e4d8'); for(let i=0;i<20;i++){ const a=(i*18-90)*PI/180; g.fillText(SEG[i],cx+Math.cos(a)*(R+10),cy+Math.sin(a)*(R+10)); }
      for(const [x,y] of S.darts||[]){ g.fillStyle='#f2c14e'; g.fillRect(x-2,y-2,4,4); g.strokeStyle='#f2c14e'; g.beginPath(); g.moveTo(x,y); g.lineTo(x+7,y+9); g.stroke(); }
      if(!S.over){ g.strokeStyle='#7dffa8'; g.lineWidth=1.5; g.beginPath(); g.arc(S.ax,S.ay,7,0,7); g.moveTo(S.ax-11,S.ay); g.lineTo(S.ax+11,S.ay); g.moveTo(S.ax,S.ay-11); g.lineTo(S.ax,S.ay+11); g.stroke(); }
      font(g,16,'#7dffa8','left'); g.fillText(`${S.left} LEFT · TURN ${Math.min(S.turn,15)} · DART ${S.inT+1}`,10,425); },
    end:S=>o.end&&o.end(S)});
  /* ---------- POOL: the rack and the cue ball; drag back from the cue ball to aim and set the power, let go to strike ---------- */
  GAMES.pool=(o={})=>({title:'POOL',w:480,h:300,again:true,help:'Press near the white ball, drag back to aim (the further, the harder), let go to strike. Clear the table; the 8 goes last.',
    start:S=>{ const B=S.balls=[], r=8, x0=330, y0=150; S.r=r; B.push({x:120,y:150,vx:0,vy:0,n:0,c:'#f4f2ec'}); const cols=['#e8c020','#2050c0','#c02020','#602080','#e07020','#208040','#802020','#101010'];
      let n=1; const order=[1,9,2,10,8,3,11,4,12,5,13,6,14,7,15]; for(let row=0,k=0;row<5;row++)for(let j=0;j<=row;j++,k++){ const id=order[k]; B.push({x:x0+row*r*1.75,y:y0+(j-row/2)*r*2.05,vx:0,vy:0,n:id,c:cols[(id-1)%8],stripe:id>8}); }
      S.shots=0; S.pots=[[18,18],[240,12],[462,18],[18,282],[240,288],[462,282]]; S.aim=null; },
    tick:(S,dt)=>{ const B=S.balls, r=S.r, cue=B[0], moving=B.some(b=>Math.hypot(b.vx,b.vy)>2);
      if(!moving&&cue){ if(S.press&&Math.hypot(S.mx-cue.x,S.my-cue.y)<40)S.aim={}; if(S.aim&&S.release){ const dx=cue.x-S.mx, dy=cue.y-S.my, d=Math.hypot(dx,dy), p=Math.min(d,140)*6; if(d>4){ cue.vx=dx/d*p; cue.vy=dy/d*p; S.shots++; } S.aim=null; } }
      for(let st=0;st<4;st++){ const h=dt/4;
        for(const b of B){ b.x+=b.vx*h; b.y+=b.vy*h; const f=Math.pow(.55,h); b.vx*=f; b.vy*=f; if(Math.hypot(b.vx,b.vy)<4){ b.vx=b.vy=0; }
          if(b.x<14+r){ b.x=14+r; b.vx=Math.abs(b.vx)*.85; } if(b.x>466-r){ b.x=466-r; b.vx=-Math.abs(b.vx)*.85; } if(b.y<14+r){ b.y=14+r; b.vy=Math.abs(b.vy)*.85; } if(b.y>286-r){ b.y=286-r; b.vy=-Math.abs(b.vy)*.85; } }
        for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){ const a=B[i], b=B[j], dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy); if(d>0&&d<2*r){ const nx=dx/d, ny=dy/d, ov=(2*r-d)/2; a.x-=nx*ov; a.y-=ny*ov; b.x+=nx*ov; b.y+=ny*ov;
          const p=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny; if(p>0){ a.vx-=p*nx; a.vy-=p*ny; b.vx+=p*nx; b.vy+=p*ny; } } } }
      for(let i=B.length-1;i>=0;i--){ const b=B[i]; if(S.pots.some(([px,py])=>Math.hypot(b.x-px,b.y-py)<15)){ if(b.n===0){ b.x=120; b.y=150; b.vx=b.vy=0; S.line='SCRATCH. THE WHITE COMES BACK.'; }
          else { B.splice(i,1); if(b.n===8&&B.length>1){ S.over=`THE 8 WENT DOWN EARLY. ${B.length-1} LEFT.`; S.score=0; return; } S.line=`THE ${b.n} IS DOWN. ${B.length-1} LEFT.`; } } }
      if(B.length===1){ S.score=S.shots; S.over=`TABLE CLEARED IN ${S.shots} SHOTS.`; } },
    draw:(S,g)=>{ g.fillStyle='#4a2a14'; g.fillRect(0,0,480,300); g.fillStyle='#1e6a3a'; g.fillRect(14,14,452,272); g.fillStyle='#0a0a0a'; for(const [x,y] of S.pots){ g.beginPath(); g.arc(x,y,13,0,7); g.fill(); }
      for(const b of S.balls){ g.fillStyle=b.stripe?'#f4f2ec':b.c; g.beginPath(); g.arc(b.x,b.y,S.r,0,7); g.fill(); if(b.stripe){ g.fillStyle=b.c; g.fillRect(b.x-S.r,b.y-3,S.r*2,6); } if(b.n){ font(g,7,'#000'); g.fillText(b.n,b.x,b.y); } }
      const cue=S.balls[0]; if(S.aim&&cue){ const dx=cue.x-S.mx, dy=cue.y-S.my, d=Math.hypot(dx,dy)||1; g.strokeStyle='#d8b878'; g.lineWidth=3; g.beginPath(); g.moveTo(cue.x-dx/d*12,cue.y-dy/d*12); g.lineTo(cue.x-dx/d*(12+Math.min(d,140)+60),cue.y-dy/d*(12+Math.min(d,140)+60)); g.stroke();
        g.strokeStyle='rgba(255,255,255,.35)'; g.lineWidth=1; g.setLineDash([4,4]); g.beginPath(); g.moveTo(cue.x,cue.y); g.lineTo(cue.x+dx/d*300,cue.y+dy/d*300); g.stroke(); g.setLineDash([]); }
      font(g,12,'#e8e4d8','left'); g.fillText(`SHOTS ${S.shots}`,18,8); },
    end:S=>o.end&&o.end(S)});
  /* ---------- SKEE-BALL: nine balls; the aim swings, hold to build power, let go to roll ---------- */
  const HOLES=[[78,36,14,100],[222,36,14,100],[150,150,14,50],[150,150,30,40],[150,150,50,30],[150,150,74,20],[150,150,100,10]];   // smallest first: a ball scores the first it is in
  GAMES.skee=(o={})=>({title:'SKEE-BALL',w:300,h:480,again:true,help:'Hold to build power, let go to roll; the arrow swings, so time it. Every 40 points is a ticket.',
    can:o.can,start:S=>{ S.left=9; S.sum=0; S.ball=null; S.pw=0; S.marks=[]; if(o.pay)o.pay(); },
    tick:(S,dt)=>{ S.t+=dt; S.ang=Math.sin(S.t*1.7)*.22;
      if(!S.ball&&S.left>0){ if(S.down)S.pw=Math.min(1,S.pw+dt*.9); if(S.release&&S.pw>0){ S.ball={x:150,y:440,vx:Math.sin(S.ang),vy:-1,p:S.pw,d:0,end:150+(rnd()-.5)*30}; S.pw=0; } }
      const b=S.ball; if(b){ b.d+=dt*420; b.x=150+b.vx*b.d*.9; b.y=440-b.d; const reach=250+b.p*220; if(b.d>=reach||b.y<20){ const lx=b.x, ly=Math.max(30,440-reach)+(rnd()-.5)*10; let s=0; for(const [hx,hy,hr,v] of HOLES)if(Math.hypot(lx-hx,ly-hy)<hr){ s=v; break; }
        S.sum+=s; S.left--; S.marks.push([lx,ly,s]); S.ball=null; S.line=`${s?s:'GUTTER'} · ${S.sum} SO FAR · ${S.left} BALL${S.left===1?'':'S'} LEFT`; if(!S.left){ S.score=S.sum; const n=Math.floor(S.sum/40); S.tickets=n; S.over=`${S.sum} POINTS: ${n} TICKET${n===1?'':'S'}.`; } } } },
    draw:(S,g)=>{ g.fillStyle='#3a2010'; g.fillRect(0,0,300,480); g.fillStyle='#d8b878'; g.fillRect(40,230,220,250); g.fillStyle='#2a2a32'; g.fillRect(10,10,280,250);
      for(const [hx,hy,hr,v] of [...HOLES].reverse()){ g.fillStyle=v>=100?'#c02838':v>=50?'#f2c14e':['#4e4e74','#3a3a58','#444466','#30304a'][(v/10)%4]; g.beginPath(); g.arc(hx,hy,hr,0,7); g.fill(); g.strokeStyle='#1a1a24'; g.lineWidth=2; g.stroke(); }
      for(const [hx,hy,hr,v] of HOLES){ font(g,11,v>=50?'#1a1a24':'#e8e4d8'); g.fillText(v,hx,v>=50?hy:hy-hr+10); }
      for(const [x,y] of S.marks)if(y){ g.fillStyle='rgba(255,255,255,.4)'; g.beginPath(); g.arc(x,y,4,0,7); g.fill(); }
      if(S.ball){ g.fillStyle='#8a4a2a'; g.beginPath(); g.arc(S.ball.x,S.ball.y,9,0,7); g.fill(); } else if(S.left){ g.strokeStyle='#7dffa8'; g.lineWidth=3; g.beginPath(); g.moveTo(150,440); g.lineTo(150+Math.sin(S.ang)*70,440-70); g.stroke(); g.fillStyle='#7dffa8'; g.fillRect(20,470-S.pw*200,10,S.pw*200); }
      font(g,13,'#e8e4d8','left'); g.fillText(`BALLS ${S.left} · ${S.sum}`,46,276); },
    end:S=>o.end&&o.end(S)});
  /* ---------- THE CLAW: steer it over a prize, drop, it grabs if it is right over one (and holds if it holds), carry it to the chute ---------- */
  GAMES.claw=(o={})=>({title:'THE CLAW',w:360,h:420,again:true,help:'Move left and right (mouse or arrows), click or space to drop. 20 seconds. Carry what it grabs to the chute on the left.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.cx=200; S.cy=60; S.ph='move'; S.time=20; S.held=null; S.toys=[]; for(let i=0;i<9;i++)S.toys.push({x:110+(i%5)*48+(rnd()-.5)*14,y:340-Math.floor(i/5)*26,c:['#c87a4a','#e8a0c8','#80c8f0','#f0e080','#a0e0a0'][i%5]}); },
    tick:(S,dt)=>{ if(S.ph==='move'){ S.time-=dt; const k=S.keys; let tx=S.mx; if(k.has('arrowleft')||k.has('a'))tx=S.cx-160*dt; if(k.has('arrowright')||k.has('d'))tx=S.cx+160*dt; S.cx+=cl(tx-S.cx,-160*dt,160*dt); S.cx=cl(S.cx,90,330); S.line=`${Math.ceil(S.time)} S`;
        if(S.press||S.time<=0){ S.ph='down'; } }
      else if(S.ph==='down'){ S.cy+=180*dt; const t=S.toys.find(t=>Math.abs(t.x-S.cx)<16&&S.cy>=t.y-18); if(t||S.cy>=350){ if(t&&rnd()<.6){ S.held=t; } S.ph='up'; } }
      else if(S.ph==='up'){ S.cy-=150*dt; if(S.held){ S.held.x=S.cx; S.held.y=S.cy+22; } if(S.cy<=60){ S.cy=60; S.ph='carry'; } }
      else if(S.ph==='carry'){ S.cx-=150*dt; if(S.held){ S.held.x=S.cx; if(rnd()<dt*.35){ S.held=null; S.line='IT SLIPS.'; } } if(S.cx<=45){ S.cx=45; const won=!!S.held; if(won){ S.toys.splice(S.toys.indexOf(S.held),1); } S.won=won; S.over=won?'IT DROPS DOWN THE CHUTE. YOURS!':'NOTHING. THE CLAW ALWAYS LETS GO.'; } } },
    draw:(S,g)=>{ g.fillStyle='#1a1020'; g.fillRect(0,0,360,420); g.fillStyle='rgba(160,200,220,.15)'; g.fillRect(70,30,280,340); g.fillStyle='#2a2a3a'; g.fillRect(14,300,52,70); font(g,11,'#f2c14e'); g.fillText('CHUTE',40,290);
      for(const t of S.toys){ g.fillStyle=t.c; g.beginPath(); g.arc(t.x,t.y,15,0,7); g.fill(); g.fillStyle='#111'; g.fillRect(t.x-5,t.y-4,3,3); g.fillRect(t.x+3,t.y-4,3,3); }
      g.strokeStyle='#c0c4c8'; g.lineWidth=2; g.beginPath(); g.moveTo(S.cx,30); g.lineTo(S.cx,S.cy); g.stroke(); const o2=S.held||S.ph==='down'?6:12; g.beginPath(); g.moveTo(S.cx-o2,S.cy+18); g.lineTo(S.cx-10,S.cy); g.lineTo(S.cx+10,S.cy); g.lineTo(S.cx+o2,S.cy+18); g.stroke(); },
    end:S=>o.end&&o.end(S)});
  /* ---------- AIR HOCKEY: your mallet follows the mouse in your half; first to 5 against the house ---------- */
  GAMES.hockey=(o={})=>({title:'AIR HOCKEY',w:320,h:480,again:true,help:'Move the mouse to move your mallet (the bottom half). First to 5.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.p={x:160,y:240,vx:0,vy:-60}; S.me={x:160,y:420,px:160,py:420}; S.ai={x:160,y:60}; S.a=0; S.b=0; },
    tick:(S,dt)=>{ const P=S.p, M=S.me, A=S.ai, R=12, MR=22, GW=60;
      M.px=M.x; M.py=M.y; M.x=cl(S.mx,MR+10,310-MR); M.y=cl(S.my,250,470-MR); const mvx=(M.x-M.px)/Math.max(dt,1e-3), mvy=(M.y-M.py)/Math.max(dt,1e-3);
      const tx=P.y<240?P.x:160, ty=P.y<240?Math.min(P.y-20,200):60, sp=230*dt; A.x+=cl(tx-A.x,-sp,sp); A.y+=cl(ty-A.y,-sp,sp); A.y=cl(A.y,MR+10,230);
      for(let st=0;st<3;st++){ const h=dt/3; P.x+=P.vx*h; P.y+=P.vy*h; P.vx*=Math.pow(.8,h); P.vy*=Math.pow(.8,h);
        if(P.x<10+R){ P.x=10+R; P.vx=Math.abs(P.vx); } if(P.x>310-R){ P.x=310-R; P.vx=-Math.abs(P.vx); }
        const inGoal=Math.abs(P.x-160)<GW; if(P.y<10+R){ if(inGoal){ S.a++; S.line=`YOU SCORE. ${S.a} : ${S.b}`; Object.assign(P,{x:160,y:240,vx:0,vy:60}); } else { P.y=10+R; P.vy=Math.abs(P.vy); } }
        if(P.y>470-R){ if(inGoal){ S.b++; S.line=`THE HOUSE SCORES. ${S.a} : ${S.b}`; Object.assign(P,{x:160,y:240,vx:0,vy:-60}); } else { P.y=470-R; P.vy=-Math.abs(P.vy); } }
        for(const [m,vx,vy] of [[M,mvx,mvy],[A,0,0]]){ const dx=P.x-m.x, dy=P.y-m.y, d=Math.hypot(dx,dy); if(d<R+MR&&d>0){ const nx=dx/d, ny=dy/d; P.x=m.x+nx*(R+MR); P.y=m.y+ny*(R+MR); const rel=(P.vx-vx)*nx+(P.vy-vy)*ny; if(rel<0){ P.vx-=1.9*rel*nx; P.vy-=1.9*rel*ny; } if(m===A){ P.vx+=nx*120; P.vy+=ny*120; } } }
        const s=Math.hypot(P.vx,P.vy); if(s>700){ P.vx*=700/s; P.vy*=700/s; } }
      if(S.a>=5||S.b>=5){ S.won=S.a>S.b; S.score=S.a; S.over=S.won?`YOU WIN ${S.a} : ${S.b}.`:`THE HOUSE WINS ${S.b} : ${S.a}.`; } },
    draw:(S,g)=>{ g.fillStyle='#14141c'; g.fillRect(0,0,320,480); g.fillStyle='#e8f0f4'; g.fillRect(10,10,300,460); g.strokeStyle='#c02838'; g.lineWidth=2; g.beginPath(); g.moveTo(10,240); g.lineTo(310,240); g.stroke(); g.beginPath(); g.arc(160,240,40,0,7); g.stroke();
      g.fillStyle='#14141c'; g.fillRect(100,4,120,8); g.fillRect(100,468,120,8);
      g.fillStyle='#202020'; g.beginPath(); g.arc(S.p.x,S.p.y,12,0,7); g.fill(); g.fillStyle='#c02838'; g.beginPath(); g.arc(S.ai.x,S.ai.y,22,0,7); g.fill(); g.fillStyle='#2060c0'; g.beginPath(); g.arc(S.me.x,S.me.y,22,0,7); g.fill();
      font(g,20,'#c02838'); g.fillText(S.b,290,210); font(g,20,'#2060c0'); g.fillText(S.a,290,270); },
    end:S=>o.end&&o.end(S)});
  /* ---------- A SHIFT AT THE PASS: the octopus puts plates up, the tables want them; click a plate, then the table that ordered it; a tip for each, more for quick ---------- */
  GAMES.orders=(o={})=>{ '@later'; const DISH=o.dishes||[['EGGS','#f0c030'],['PANCAKES','#d89848'],['BURGER','#8a5a2a'],['BLT','#58a038'],['PIE','#c87a3a'],['SHAKE','#e8a0c8']], TB=[[50,330,'C1'],[120,330,'C2'],[190,330,'C3'],[260,330,'C4'],[330,330,'C5'],[85,405,'B1'],[200,405,'B2'],[315,405,'B3']];
    return {title:o.title||'A SHIFT AT THE PASS',w:400,h:440,again:true,help:'Plates come up in the window. Click a plate, then the table whose ticket matches. Quick is a bigger tip; a plate left too long goes cold. The shift is 60 seconds.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.left=60; S.plates=[]; S.want=TB.map(()=>null); S.hold=-1; S.tips=0; S.served=0; S.cold=0; S.next=1; },
    tick:(S,dt)=>{ S.left-=dt; S.next-=dt;
      if(S.next<=0){ S.next=2.2+rnd()*1.6; const free=S.want.map((w,i)=>w?-1:i).filter(i=>i>=0); if(free.length&&S.plates.length<4){ const i=free[Math.floor(rnd()*free.length)], d=Math.floor(rnd()*DISH.length); S.want[i]={d,t:0}; setTimeout(()=>{ if(S.plates&&S.plates.length<4&&!S.over)S.plates.push({d,t:0}); },600+rnd()*900); } }
      for(const w of S.want)if(w){ w.t+=dt; } for(const p of S.plates)p.t+=dt;
      S.want.forEach((w,i)=>{ if(w&&w.t>16){ S.want[i]=null; S.cold++; S.line=`TABLE ${TB[i][2]} GAVE UP WAITING.`; } });
      for(let k=S.plates.length-1;k>=0;k--)if(S.plates[k].t>14){ S.plates.splice(k,1); if(S.hold===k)S.hold=-1; else if(S.hold>k)S.hold--; S.cold++; S.line='A PLATE WENT COLD UNDER THE LAMP.'; }
      if(S.press){ const px=S.mx, py=S.my; const k=S.plates.findIndex((p,j)=>Math.abs(px-(60+j*95))<40&&Math.abs(py-95)<36); if(k>=0)S.hold=k;
        else if(S.hold>=0){ const i=TB.findIndex(([x,y])=>Math.abs(px-x)<32&&Math.abs(py-y)<28); if(i>=0){ const p=S.plates[S.hold], w=S.want[i];
          if(w&&w.d===p.d){ const tip=w.t<5?3:w.t<10?2:1; S.tips+=tip; S.served++; S.want[i]=null; S.plates.splice(S.hold,1); S.line=`${DISH[p.d][0]} TO ${TB[i][2]}: $${tip} TIP.`; }
          else S.line=w?`${TB[i][2]} ORDERED ${DISH[w.d][0]}, NOT ${DISH[p.d][0]}.`:`${TB[i][2]} HAS NOT ORDERED.`; S.hold=-1; } } }
      if(S.left<=0){ S.score=S.tips; S.over=`SHIFT OVER: ${S.served} PLATE${S.served===1?'':'S'} OUT, $${S.tips} IN TIPS${S.cold?`, ${S.cold} LOST`:''}.`; } },
    draw:(S,g)=>{ g.fillStyle='#2a1a16'; g.fillRect(0,0,400,440); g.fillStyle='#b8bcc0'; g.fillRect(10,40,380,110); g.fillStyle='#ffa040'; g.globalAlpha=.25; g.fillRect(10,40,380,30); g.globalAlpha=1;
      font(g,12,'#f4ecd8'); g.fillText(`THE PASS · ${Math.max(0,Math.ceil(S.left))} s · $${S.tips} TIPS`,200,20);
      S.plates.forEach((p,j)=>{ const x=60+j*95, y=95; g.fillStyle=S.hold===j?'#ffe080':'#f4f6f6'; g.beginPath(); g.arc(x,y,32,0,7); g.fill(); g.fillStyle=DISH[p.d][1]; g.beginPath(); g.arc(x,y,18,0,7); g.fill(); font(g,10,'#1a1a1a'); g.fillText(DISH[p.d][0],x,y+42<150?y+42:140); if(p.t>9){ g.fillStyle='rgba(120,160,220,'+Math.min(.5,(p.t-9)/10)+')'; g.beginPath(); g.arc(x,y,32,0,7); g.fill(); } });
      g.fillStyle='#c0303a'; g.fillRect(10,290,380,6); for(const [i,[x,y,n]] of TB.entries()){ g.fillStyle=n[0]==='C'?'#e6dcc6':'#d8c8a8'; g.fillRect(x-28,y-22,56,44); font(g,10,'#5a2a24'); g.fillText(n,x,y+14);
        const w=S.want[i]; if(w){ g.fillStyle=w.t>11?'#e05030':'#f4f0e0'; g.fillRect(x-26,y-40,52,22); font(g,9,'#1a1a1a'); g.fillText(DISH[w.d][0],x,y-29); g.fillStyle=DISH[w.d][1]; g.fillRect(x-26,y-19,52*Math.max(0,1-w.t/16),3); } }
      if(S.hold>=0){ g.strokeStyle='#ffe080'; g.lineWidth=2; g.beginPath(); g.moveTo(60+S.hold*95,128); g.lineTo(S.mx,S.my); g.stroke(); } },
    end:S=>o.end&&o.end(S)}; };
  /* ---------- SOLDERING: five joints on a board; hold the iron on each until the heat is in the green, then let go; too long and it burns ---------- */
  GAMES.solder=(o={})=>({title:o.title||'THE REPAIR BENCH',w:400,h:360,again:false,help:'Hold the mouse on a joint to heat it; let go while the bar is green. Five good joints mend it; three burns and it is scrap.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.J=Array.from({length:5},(_,i)=>({x:70+i*65+(rnd()-.5)*20,y:150+(rnd()-.5)*90,h:0,ok:false})); S.burn=0; S.cur=-1; S.lo=.55+rnd()*.1; S.hi=S.lo+.22; },
    tick:(S,dt)=>{ if(S.down){ if(S.cur<0)S.cur=S.J.findIndex(j=>!j.ok&&Math.hypot(S.mx-j.x,S.my-j.y)<18); const j=S.J[S.cur]; if(j){ j.h+=dt*.55; if(j.h>1){ S.burn++; j.h=0; S.cur=-1; S.line=`A BURNT JOINT (${S.burn} OF 3).`; } } }
      else if(S.cur>=0){ const j=S.J[S.cur]; if(j.h>=S.lo&&j.h<=S.hi){ j.ok=true; S.line='A CLEAN JOINT.'; } else { S.line=j.h<S.lo?'NOT HOT ENOUGH: TRY AGAIN.':'TOO HOT: IT GOES DULL.'; if(j.h>S.hi)S.burn++; } j.h=0; S.cur=-1; }
      const n=S.J.filter(j=>j.ok).length; if(n===5){ S.score=1; S.over='ALL FIVE JOINTS SHINE: IT WORKS!'; } else if(S.burn>=3){ S.score=0; S.over='THREE BURNS: THE BOARD IS SCRAP.'; } },
    draw:(S,g)=>{ g.fillStyle='#1a1612'; g.fillRect(0,0,400,360); g.fillStyle='#2a6a3a'; g.fillRect(30,70,340,170); g.strokeStyle='#c8a048'; g.lineWidth=2; for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(S.J[i].x,S.J[i].y); g.lineTo(S.J[i+1].x,S.J[i+1].y); g.stroke(); }
      for(const [i,j] of S.J.entries()){ g.fillStyle=j.ok?'#e8eef0':'#8a8a80'; g.beginPath(); g.arc(j.x,j.y,12,0,7); g.fill(); if(i===S.cur){ g.fillStyle='rgba(255,140,40,'+(.3+j.h*.6)+')'; g.beginPath(); g.arc(j.x,j.y,16,0,7); g.fill(); } }
      g.fillStyle='#333'; g.fillRect(40,270,320,18); g.fillStyle='#2a8a3a'; g.fillRect(40+S.lo*320,270,(S.hi-S.lo)*320,18); const j=S.J[S.cur]; if(j){ g.fillStyle='#ffb040'; g.fillRect(40,274,Math.min(1,j.h)*320,10); }
      font(g,12,'#f4ecd8'); g.fillText(`JOINTS ${S.J.filter(j=>j.ok).length}/5 · BURNS ${S.burn}/3`,200,30); },
    end:S=>o.end&&o.end(S)});
  /* ---------- WAXING A DECK: rub the wax over the whole deck before the time runs out ---------- */
  GAMES.wax=(o={})=>({title:o.title||'WAX AND GRIP',w:360,h:300,again:false,help:'Hold the mouse down and rub the wax over the deck. Cover it all in 20 seconds.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.left=20; S.c=new Set(); S.in=new Set(); for(let x=0;x<24;x++)for(let y=0;y<7;y++){ const px=40+x*12+6, py=110+y*12+6; if(((px-184)/150)**2+((py-152)/46)**2<1)S.in.add(x+','+y); } },
    tick:(S,dt)=>{ S.left-=dt; if(S.down)for(let a=-2;a<=2;a++)for(let b=-1;b<=1;b++){ const cx=Math.floor((S.mx-40)/12)+a, cy=Math.floor((S.my-110)/12)+b; if(S.in.has(cx+','+cy))S.c.add(cx+','+cy); }
      const k=S.c.size/S.in.size; S.line=`${Math.round(k*100)}% WAXED · ${Math.max(0,Math.ceil(S.left))} s`; if(k>=.92){ S.score=1; S.over='THE DECK SHINES, THE GRIP BITES.'; } else if(S.left<=0){ S.score=0; S.over=`ONLY ${Math.round(k*100)}%: PATCHY. TRY AGAIN.`; } },
    draw:(S,g)=>{ g.fillStyle='#2a2018'; g.fillRect(0,0,360,300); g.fillStyle='#b08850'; g.beginPath(); g.ellipse(184,152,150,46,0,0,7); g.fill(); g.strokeStyle='#8a6a3a'; for(let i=0;i<6;i++){ g.beginPath(); g.moveTo(44,128+i*8); g.bezierCurveTo(140,120+i*9,230,140+i*7,324,130+i*8); g.stroke(); }
      g.fillStyle='rgba(255,250,230,.45)'; for(const k of S.c){ const [x,y]=k.split(',').map(Number); g.fillRect(40+x*12,110+y*12,12,12); } },
    end:S=>o.end&&o.end(S)});
  /* ---------- CUTTING A GEM: the wheel's edge swings; click when it lies on the marked facet; six facets cut it, three slips and the stone is left rough ---------- */
  GAMES.facet=(o={})=>({title:o.title||'THE CUTTING WHEEL',w:360,h:360,again:false,help:'The wheel swings over the stone. Click when it lies along the gold mark. Six clean facets cut it; three slips and you stop.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.n=0; S.miss=0; S.a=0; S.sp=1.6; S.tg=rnd()*Math.PI; },
    tick:(S,dt)=>{ S.t+=dt; S.a=Math.PI/2+Math.sin(S.t*S.sp)*1.4; if(S.press){ let d=Math.abs(((S.a-S.tg)%Math.PI+Math.PI*1.5)%Math.PI-Math.PI/2); if(d<.09){ S.n++; S.sp+=.25; S.tg=rnd()*Math.PI; S.line=`A CLEAN FACET (${S.n} OF 6).`; } else { S.miss++; S.line=`THE WHEEL SLIPS (${S.miss} OF 3).`; } }
      if(S.n>=6){ S.score=1; S.over='SIX FACETS: THE STONE IS CUT.'; } else if(S.miss>=3){ S.score=0; S.over='THREE SLIPS: YOU STOP BEFORE YOU CRACK IT. TRY AGAIN.'; } },
    draw:(S,g)=>{ g.fillStyle='#1a1614'; g.fillRect(0,0,360,360); const cx=180, cy=180; g.fillStyle=o.color||'#a050c0'; g.beginPath(); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, r=i<S.n+2?70:80; g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); } g.closePath(); g.fill();
      g.strokeStyle='#f0c040'; g.lineWidth=3; g.beginPath(); g.moveTo(cx-Math.cos(S.tg)*110,cy-Math.sin(S.tg)*110); g.lineTo(cx+Math.cos(S.tg)*110,cy+Math.sin(S.tg)*110); g.stroke();
      g.strokeStyle='#c8ccd0'; g.lineWidth=2; g.beginPath(); g.moveTo(cx-Math.cos(S.a)*130,cy-Math.sin(S.a)*130); g.lineTo(cx+Math.cos(S.a)*130,cy+Math.sin(S.a)*130); g.stroke();
      font(g,12,'#f4ecd8'); g.fillText(`FACETS ${S.n}/6 · SLIPS ${S.miss}/3`,180,24); },
    end:S=>o.end&&o.end(S)});
}
export {GAMES};
