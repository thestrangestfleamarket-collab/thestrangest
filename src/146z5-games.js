// THE GAMES: the insides' small games for the minigames' window (MINI): darts (301 on a real board), pool (rack, cue ball, pockets), skee-ball (aim, a rising and falling power, the rings), the claw machine (a swinging head, a grip as good as your aim, carry it to the chute), air hockey (against the house), a shift at the pass (plates to the tables, for tips), soldering a repair, waxing a deck, cutting a gem. Each GAMES.x(opts) gives a game; opts.end(S) gets the result.
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
  /* ---------- SKEE-BALL: nine balls; the aim swings, hold and the power rises and falls, let go to roll ---------- */
  const HOLES=[[78,36,14,100],[222,36,14,100],[150,150,14,50],[150,150,30,40],[150,150,50,30],[150,150,74,20],[150,150,100,10]];   // smallest first: a ball scores the first it is in
  const ball=(g,x,y,r,a=1)=>{ const q=g.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r); q.addColorStop(0,'#f0b07a'); q.addColorStop(.5,'#a8582c'); q.addColorStop(1,'#4a200c'); g.globalAlpha=a; g.fillStyle=q; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); g.globalAlpha=1; };
  GAMES.skee=(o={})=>({title:'SKEE-BALL',w:300,h:480,again:true,help:'Hold and the power rises and falls; let go to roll. The arrow swings, so time both. Every 40 points is a ticket.',
    can:o.can,start:S=>{ S.left=9; S.sum=0; S.ball=null; S.pw=0; S.dir=1; S.marks=[]; S.pops=[]; S.flash=null; if(o.pay)o.pay(); },
    tick:(S,dt)=>{ S.t+=dt; S.ang=Math.sin(S.t*1.7)*.22;
      if(!S.ball&&S.left>0){ if(S.press){ S.pw=0; S.dir=1; } if(S.down){ S.pw+=S.dir*dt*1.1; if(S.pw>=1){ S.pw=1; S.dir=-1; } if(S.pw<=.02){ S.pw=.02; S.dir=1; } }
        if(S.release&&S.pw>0){ S.ball={x:150,y:440,vx:Math.sin(S.ang),vy:-1,p:S.pw,d:0,end:150+(rnd()-.5)*30}; S.pw=0; } }
      for(const p of S.pops)p[3]+=dt; S.pops=S.pops.filter(p=>p[3]<1.2); if(S.flash&&(S.flash.t+=dt)>1)S.flash=null;
      const b=S.ball; if(b){ b.d+=dt*420; b.x=150+b.vx*b.d*.9; b.y=440-b.d; const reach=250+b.p*220; if(b.d>=reach||b.y<20){ const lx=b.x, ly=Math.max(30,440-reach)+(rnd()-.5)*10; let s=0, hi=-1; HOLES.some(([hx,hy,hr,v],i)=>Math.hypot(lx-hx,ly-hy)<hr&&(s=v,hi=i,true));
        S.sum+=s; S.left--; S.marks.push([lx,ly,s]); S.pops.push([lx,ly,s?'+'+s:'GUTTER',0]); if(hi>=0)S.flash={i:hi,t:0}; S.ball=null; S.line=`${s?s:'GUTTER'} · ${S.sum} SO FAR · ${S.left} BALL${S.left===1?'':'S'} LEFT`; if(!S.left){ S.score=S.sum; const n=Math.floor(S.sum/40); S.tickets=n; S.over=`${S.sum} POINTS: ${n} TICKET${n===1?'':'S'}.`; } } } },
    draw:(S,g)=>{ const t=S.t;
      let q=g.createLinearGradient(0,0,300,0); q.addColorStop(0,'#2a1408'); q.addColorStop(.5,'#4a2812'); q.addColorStop(1,'#2a1408'); g.fillStyle=q; g.fillRect(0,0,300,480);
      q=g.createRadialGradient(150,140,20,150,140,220); q.addColorStop(0,'#2e2850'); q.addColorStop(1,'#0e0c1c'); g.fillStyle=q; g.fillRect(10,10,280,250);
      g.strokeStyle='rgba(255,255,255,.04)'; g.lineWidth=1; for(let x=14;x<290;x+=8){ g.beginPath(); g.moveTo(x,10); g.lineTo(x,260); g.stroke(); }
      for(let i=0;i<34;i++){ const [x,y]=i<16?[5,8+i*16]:i<18?[i===16?18:282,4]:[295,8+(i-18)*16], on=Math.floor(t*6+i)%3===0; g.fillStyle=on?'#ffe08a':'#6a4a20'; if(on){ g.shadowColor='#ffcc40'; g.shadowBlur=8; } g.beginPath(); g.arc(x,y,2.6,0,7); g.fill(); g.shadowBlur=0; }
      for(let x=30;x<280;x+=14){ const on=Math.floor(t*6+x/14)%3===0; g.fillStyle=on?'#ffe08a':'#6a4a20'; if(on){ g.shadowColor='#ffcc40'; g.shadowBlur=8; } g.beginPath(); g.arc(x,4,2.6,0,7); g.fill(); g.shadowBlur=0; }
      [...HOLES].reverse().forEach(([hx,hy,hr,v])=>{ const i=HOLES.findIndex(h=>h[3]===v&&h[0]===hx), fl=S.flash&&S.flash.i===i&&Math.floor(S.flash.t*10)%2===0;
        const c=fl?['#fff6c0','#fff0a0']:v>=100?['#ff5a68','#8a1020']:v>=50?['#ffe27a','#c08a10']:[['#6a6aa8','#2c2c50'],['#5a5a96','#262646'],['#64649e','#2a2a4c'],['#545490','#222240']][(v/10)%4];
        q=g.createRadialGradient(hx-hr*.3,hy-hr*.35,hr*.1,hx,hy,hr); q.addColorStop(0,c[0]); q.addColorStop(1,c[1]); g.fillStyle=q; if(v>=50||fl){ g.shadowColor=fl?'#fff':v>=100?'#ff3040':'#ffc020'; g.shadowBlur=fl?18:10; } g.beginPath(); g.arc(hx,hy,hr,0,7); g.fill(); g.shadowBlur=0;
        g.strokeStyle='#08080e'; g.lineWidth=3; g.stroke(); g.strokeStyle='rgba(255,255,255,.18)'; g.lineWidth=1; g.beginPath(); g.arc(hx,hy,hr-2,PI*1.05,PI*1.6); g.stroke(); });
      for(const [hx,hy,hr,v] of HOLES){ g.font='bold 11px monospace'; g.textAlign='center'; g.textBaseline='middle'; const y=v>=50?hy:hy-hr+11; g.fillStyle='rgba(0,0,0,.5)'; g.fillText(v,hx+1,y+1); g.fillStyle=v>=50?'#2a1008':'#f0ecff'; g.fillText(v,hx,y); }
      for(const [x,y] of S.marks)ball(g,x,y,4,.7);
      g.fillStyle='#1a0c04'; g.fillRect(0,258,300,8);
      g.save(); g.beginPath(); g.moveTo(44,480); g.lineTo(256,480); g.lineTo(232,266); g.lineTo(68,266); g.closePath(); g.clip();
      q=g.createLinearGradient(0,266,0,480); q.addColorStop(0,'#b88a50'); q.addColorStop(1,'#e6c088'); g.fillStyle=q; g.fillRect(40,266,220,214);
      g.strokeStyle='rgba(90,50,20,.22)'; g.lineWidth=1; for(let k=-5;k<=5;k++){ g.beginPath(); g.moveTo(150+k*21.2,480); g.lineTo(150+k*16.4,266); g.stroke(); }
      for(let y=300;y<480;y+=46){ g.strokeStyle='rgba(90,50,20,.12)'; g.beginPath(); g.moveTo(40,y); g.lineTo(260,y); g.stroke(); }
      q=g.createLinearGradient(0,266,0,300); q.addColorStop(0,'rgba(20,8,0,.6)'); q.addColorStop(.5,'rgba(255,230,180,.25)'); q.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=q; g.fillRect(40,266,220,34);
      if(!S.ball&&S.left){ g.setLineDash([5,6]); g.strokeStyle='rgba(125,255,168,.35)'; g.lineWidth=2; g.beginPath(); g.moveTo(150,440); g.lineTo(150+Math.sin(S.ang)*.9*180,440-180); g.stroke(); g.setLineDash([]); }
      g.restore();
      for(const [x0,x1] of [[44,68],[256,232]]){ q=g.createLinearGradient(x0-12,0,x0+12,0); q.addColorStop(0,'#6a3a18'); q.addColorStop(1,'#3a1c08'); g.strokeStyle='#8a5a2a'; g.lineWidth=5; g.beginPath(); g.moveTo(x0,480); g.lineTo(x1,266); g.stroke(); }
      g.fillStyle='#050505'; g.fillRect(84,270,132,22); g.strokeStyle='#5a3a1a'; g.lineWidth=2; g.strokeRect(84,270,132,22);
      g.font='bold 13px monospace'; g.textBaseline='middle'; g.shadowColor='#ff3020'; g.shadowBlur=6; g.fillStyle='#ff4a30'; g.textAlign='left'; g.fillText(String(S.sum).padStart(3,'0'),92,281); g.textAlign='right'; g.fillStyle='#ffb020'; g.shadowColor='#ffa000'; g.fillText('BALL '+(S.left?10-S.left:9)+'/9',208,281); g.shadowBlur=0;
      for(let i=0;i<S.left-(S.ball?0:1);i++)ball(g,74+i*12,468,5);
      if(S.ball){ const r=9-3*(440-S.ball.y)/420; g.fillStyle='rgba(40,20,0,.35)'; g.beginPath(); g.ellipse(S.ball.x+2,S.ball.y+r*.7,r,r*.45,0,0,7); g.fill(); ball(g,S.ball.x,S.ball.y,r); }
      else if(S.left){ const a=S.ang, ex=150+Math.sin(a)*70, ey=440-Math.cos(a)*70; ball(g,150,440,9);
        g.save(); g.translate(150,440); g.rotate(a); g.shadowColor='#7dffa8'; g.shadowBlur=10; g.fillStyle='#7dffa8'; g.fillRect(-2,-62,4,48); g.beginPath(); g.moveTo(0,-76); g.lineTo(-9,-60); g.lineTo(9,-60); g.closePath(); g.fill(); g.restore(); g.shadowBlur=0; }
      g.fillStyle='#120804'; g.fillRect(10,288,22,186); g.strokeStyle='#8a5a2a'; g.lineWidth=2; g.strokeRect(10,288,22,186);
      q=g.createLinearGradient(0,472,0,290); q.addColorStop(0,'#3cd070'); q.addColorStop(.6,'#f2d040'); q.addColorStop(1,'#ff3a30'); const h=S.pw*182; g.fillStyle=q; g.shadowColor=S.pw>.85?'#ff3a30':'#7dffa8'; g.shadowBlur=S.pw?8:0; g.fillRect(14,472-h,14,h); g.shadowBlur=0;
      g.fillStyle='rgba(255,255,255,.25)'; for(let k=1;k<10;k++)g.fillRect(14,472-k*18.2,k%5?5:14,1);
      for(const [x,y,s,a] of S.pops){ g.globalAlpha=Math.max(0,1-a/1.2); g.font='bold 16px monospace'; g.textAlign='center'; g.fillStyle='#000'; g.fillText(s,x+1,y-a*30+1); g.fillStyle=s==='GUTTER'?'#c8c8d8':'#ffe27a'; g.fillText(s,x,y-a*30); g.globalAlpha=1; } },
    end:S=>o.end&&o.end(S)});
  /* ---------- THE CLAW: the head swings on its cable, so let it settle; the grip is as good as you centre it; carry it gently to the chute and let go ---------- */
  const TOYC=[['#c8844e','#7a4220'],['#f0a8cc','#a85a80'],['#88c8f0','#3a78a8'],['#f4e07a','#b09020'],['#a8e0a0','#4a8a48'],['#e87070','#902c2c'],['#d8c8f0','#7a64a8']];
  const toy=(g,t)=>{ const {x,y,r,k,c}=t, [c0,c1]=TOYC[c], sh=(px,py,pr)=>{ const q=g.createRadialGradient(px-pr*.35,py-pr*.4,pr*.15,px,py,pr); q.addColorStop(0,c0); q.addColorStop(1,c1); g.fillStyle=q; g.beginPath(); g.arc(px,py,pr,0,7); g.fill(); };
    g.save(); g.translate(x,y); g.rotate(t.a||0);
    if(k===0){ sh(-r*.68,-r*.7,r*.36); sh(r*.68,-r*.7,r*.36); g.fillStyle=c1; g.beginPath(); g.arc(-r*.68,-r*.7,r*.17,0,7); g.arc(r*.68,-r*.7,r*.17,0,7); g.fill(); }
    if(k===1){ for(const s of [-1,1]){ g.fillStyle=c1; g.beginPath(); g.ellipse(s*r*.4,-r*1.05,r*.22,r*.6,s*.2,0,7); g.fill(); g.fillStyle=c0; g.beginPath(); g.ellipse(s*r*.4,-r*1.0,r*.11,r*.42,s*.2,0,7); g.fill(); } }
    if(k===2){ g.fillStyle=c1; for(const s of [-1,1]){ g.beginPath(); g.moveTo(s*r*.85,-r*.25); g.lineTo(s*r*.7,-r*1.15); g.lineTo(s*r*.15,-r*.8); g.closePath(); g.fill(); } }
    sh(0,0,r); g.fillStyle='rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(0,r*.3,r*.5,r*.35,0,0,7); g.fill();
    g.fillStyle='#141018'; g.beginPath(); g.arc(-r*.32,-r*.15,r*.11,0,7); g.arc(r*.32,-r*.15,r*.11,0,7); g.fill(); g.fillStyle='#fff'; g.fillRect(-r*.35,-r*.22,1.5,1.5); g.fillRect(r*.29,-r*.22,1.5,1.5);
    if(k===3){ g.fillStyle='#f29a2a'; g.beginPath(); g.ellipse(0,r*.12,r*.3,r*.14,0,0,7); g.fill(); } else { g.fillStyle='#2a1a1a'; g.beginPath(); g.arc(0,r*.1,r*.09,0,7); g.fill(); g.fillStyle='rgba(255,90,120,.35)'; g.beginPath(); g.arc(-r*.55,r*.15,r*.14,0,7); g.arc(r*.55,r*.15,r*.14,0,7); g.fill(); }
    g.restore(); };
  const settle=(T,dt,held)=>{ const A=T.filter(t=>t!==held&&!t.zz); for(const t of A){ t.vy+=900*dt; t.ox=t.x; t.oy=t.y; t.y+=t.vy*dt; t.x+=t.vx*dt; t.vx*=Math.pow(.2,dt); }
    for(let it=0;it<4;it++)for(const a of A){ if(a.y>348-a.r){ a.y=348-a.r; a.vy=0; } if(a.x<80+a.r&&!(a.free&&a.x<72)){ a.x=80+a.r; a.vx=0; } if(a.x>340-a.r){ a.x=340-a.r; a.vx=0; }
      for(const b of T){ if(b===a)continue; const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy), m=a.r+b.r-2; if(d<m&&d>0){ const k=b===held||b.zz?1:.5; a.x+=dx/d*(m-d)*k; a.y+=dy/d*(m-d)*k; if(dy<0)a.vy=Math.min(a.vy,0); } } }
    for(const t of A){ t.still=Math.hypot(t.x-t.ox,t.y-t.oy)<.15?(t.still||0)+1:0; if(t.still>20){ t.zz=true; t.vx=t.vy=0; } } };
  const wake=(T,t)=>{ for(const b of T)if(b!==t&&b.y<t.y&&Math.abs(b.x-t.x)<b.r+t.r){ b.zz=false; b.still=0; } };
  GAMES.claw=(o={})=>({title:'THE CLAW',w:360,h:420,again:true,help:'Move (mouse or arrows); the claw swings, so let it settle. Click or space to drop. The grip is as good as you centre it; carry it gently over the chute and click to let go. 25 seconds.',
    can:o.can,start:S=>{ if(o.pay)o.pay(); S.tx=210; S.hx=210; S.hv=0; S.cy=56; S.ph='move'; S.time=25; S.held=null; S.open=1; S.lastmx=S.mx;
      S.toys=[]; for(let i=0;i<13;i++)S.toys.push({x:100+rnd()*230,y:120+rnd()*200,vx:0,vy:0,r:13+rnd()*6,k:Math.floor(rnd()*4),c:Math.floor(rnd()*TOYC.length),a:(rnd()-.5)*.5});
      for(let i=0;i<600;i++)settle(S.toys,1/60,null); for(const t of S.toys){ t.vx=t.vy=0; t.zz=true; } S.prize=null; },
    tick:(S,dt)=>{ const k=S.keys, kl=k.has('arrowleft')||k.has('a'), kr=k.has('arrowright')||k.has('d'); if(kl||kr)S.kb=true; if(S.mx!==S.lastmx){ S.kb=false; S.lastmx=S.mx; }
      settle(S.toys,dt,S.held); if(S.ph!=='done')S.time-=dt;
      const steer=S.ph==='move'||S.ph==='carry', goal=steer?(S.kb?S.tx+(kr-kl)*400:S.mx):S.tx; const want=steer?cl((cl(goal,40,330)-S.tx)*4,-150,150):0; S.tv=(S.tv||0)+cl(want-(S.tv||0),-600*dt,600*dt); S.tx=cl(S.tx+S.tv*dt,40,330);
      S.hv+=((S.tx-S.hx)*26-S.hv*2.2)*dt; S.hx+=S.hv*dt; const tipY=S.cy+24;
      if(S.held){ const h=S.held; h.x=S.hx; h.y=tipY+h.r-6; h.vx=S.hv; h.vy=0; const shake=Math.abs(S.hv-(S.tv||0))/5; if(rnd()<dt*Math.max(0,(1-S.grip)**2*2+(shake>6?(shake-6)*.08*(1.2-S.grip):0))){ S.held=null; h.vy=40; h.still=0; S.line='IT SLIPS OUT.'; } }
      if(S.ph==='move'){ S.line=`${Math.ceil(S.time)} S`; if(S.press||S.time<=0){ S.ph='down'; S.open=1; } }
      else if(S.ph==='down'){ S.cy+=170*dt; const t=S.toys.find(t=>Math.abs(t.x-S.hx)<t.r*.9&&tipY>=t.y-t.r); if(t||tipY>=344){ S.ph='close'; S.cl=0; S.target=t; S.aim=t?[t.x-S.hx,S.hv]:null; } }
      else if(S.ph==='close'){ S.cl+=dt; S.open=Math.max(0,1-S.cl*2.5); if(S.cl>.45){ const t=S.target; if(t){ const buried=S.toys.filter(b=>b!==t&&b.y<t.y-t.r*.6&&Math.abs(b.x-t.x)<b.r+t.r-4).length;
          S.grip=cl(1-Math.abs(S.aim[0])/(t.r*.75)-buried*.35-(t.r-13)*.02-Math.min(.4,Math.abs(S.aim[1])/150),0,1); if(S.grip>.2){ S.held=t; t.zz=false; wake(S.toys,t); S.line=S.grip>.8?'A GOOD GRIP.':S.grip>.5?'IT HOLDS... FOR NOW.':'BARELY GOT IT.'; } else S.line='THE PRONGS SLIDE OFF.'; } else S.line='NOTHING THERE.'; S.ph='up'; } }
      else if(S.ph==='up'){ S.cy-=130*dt; if(S.cy<=56){ S.cy=56; S.ph=S.held?'carry':'home'; } }
      else if(S.ph==='carry'){ if(!S.held){ S.ph='home'; } else { S.line=`${Math.ceil(S.time)} S · OVER THE CHUTE, CLICK TO LET GO`; if(S.press||S.time<=0){ S.prize=S.held; S.prize.still=0; S.held=null; S.prize.vy=0; S.prize.free=true; S.open=1; S.ph='home'; } } }
      else if(S.ph==='home'){ S.open=Math.min(1,S.open+dt*2); }
      const p=S.prize; if(p&&p.x<72&&p.y>230){ S.toys.splice(S.toys.indexOf(p),1); S.prize=null; S.won=true; S.ph='done'; S.over='IT DROPS DOWN THE CHUTE. YOURS!'; return; }
      if(S.ph==='home'){ S.ht=(S.ht||0)+dt; if(S.ht>1.6){ S.won=false; S.over=S.line==='IT SLIPS OUT.'?'IT SLIPPED. THE CLAW ALWAYS LETS GO.':'NOTHING THIS TIME.'; } } },
    draw:(S,g)=>{ const t=S.t||0;
      let q=g.createLinearGradient(0,0,360,0); q.addColorStop(0,'#5a0c18'); q.addColorStop(.5,'#9a1828'); q.addColorStop(1,'#5a0c18'); g.fillStyle=q; g.fillRect(0,0,360,420);
      g.fillStyle='#14080c'; g.fillRect(8,26,344,336);
      q=g.createLinearGradient(0,30,0,360); q.addColorStop(0,'#2a2048'); q.addColorStop(1,'#120c22'); g.fillStyle=q; g.fillRect(12,30,336,330);
      g.fillStyle='rgba(255,120,200,.06)'; for(let i=0;i<8;i++){ g.beginPath(); g.arc(80+i*38,80+(i%3)*30,30,0,7); g.fill(); }
      g.fillStyle='#1a1424'; g.fillRect(14,236,58,124); for(let x=14;x<72;x+=10){ g.fillStyle=(x/10)%2?'#f2c14e':'#141018'; g.beginPath(); g.moveTo(x,236); g.lineTo(x+10,236); g.lineTo(x+5,244); g.lineTo(x-5,244); g.fill(); }
      g.fillStyle='#000'; g.fillRect(18,250,50,110); g.fillStyle='#c0c4c8'; g.fillRect(72,230,6,130); g.font='bold 11px monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#f2c14e'; g.shadowColor='#f2c14e'; g.shadowBlur=6; g.fillText('PRIZE',43,262); g.fillText('CHUTE',43,276); g.shadowBlur=0;
      g.fillStyle='#e8d8f0'; g.fillRect(78,348,266,12); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(78,348,266,3);
      for(const p of S.toys)toy(g,p);
      q=g.createLinearGradient(0,36,0,46); q.addColorStop(0,'#e8ecf0'); q.addColorStop(1,'#6a6e74'); g.fillStyle=q; g.fillRect(14,38,332,7);
      g.fillStyle='#3a3e44'; g.fillRect(S.tx-14,34,28,14); g.fillStyle='#c0c4c8'; g.fillRect(S.tx-12,36,24,10);
      g.strokeStyle='#9aa0a8'; g.lineWidth=1.5; g.beginPath(); g.moveTo(S.tx,46); g.lineTo(S.hx,S.cy); g.stroke();
      const hx=S.hx, hy=S.cy, ang=Math.atan2(S.hx-S.tx,S.cy-46);
      g.save(); g.translate(hx,hy); g.rotate(-ang*.6); q=g.createLinearGradient(-10,0,10,0); q.addColorStop(0,'#7a7e84'); q.addColorStop(.5,'#f0f2f4'); q.addColorStop(1,'#6a6e74'); g.fillStyle=q; g.fillRect(-10,-6,20,12); g.fillStyle='#c02838'; g.fillRect(-10,-2,20,3);
      g.strokeStyle='#d8dce0'; g.lineWidth=3; g.lineCap='round'; const sp=4+S.open*10;
      for(const s of [-1,1]){ g.beginPath(); g.moveTo(s*6,6); g.quadraticCurveTo(s*(sp+6),14,s*(sp*.6),26); g.lineTo(s*(sp*.6-s*4),24); g.stroke(); }
      g.beginPath(); g.moveTo(0,6); g.lineTo(0,22); g.stroke(); g.lineCap='butt'; g.restore();
      g.fillStyle='rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(90,30); g.lineTo(140,30); g.lineTo(60,360); g.lineTo(10,360); g.fill(); g.beginPath(); g.moveTo(250,30); g.lineTo(268,30); g.lineTo(188,360); g.lineTo(170,360); g.fill();
      g.fillStyle='#0c0408'; g.fillRect(0,0,360,24); g.font='bold 16px monospace'; g.fillStyle='#ff7ac0'; g.shadowColor='#ff4fa0'; g.shadowBlur=10; g.fillText('THE  CLAW',180,13); g.shadowBlur=0;
      for(let x=10;x<360;x+=16){ const on=Math.floor(t*5+x/16)%3===0; g.fillStyle=on?'#ffe08a':'#5a3a20'; g.beginPath(); g.arc(x,x%32?4:20,2.2,0,7); g.fill(); }
      q=g.createLinearGradient(0,362,0,420); q.addColorStop(0,'#3a3e44'); q.addColorStop(1,'#16181c'); g.fillStyle=q; g.fillRect(0,362,360,58);
      g.fillStyle='#050505'; g.fillRect(150,374,60,24); g.font='bold 16px monospace'; g.fillStyle='#ff4a30'; g.shadowColor='#ff3020'; g.shadowBlur=6; g.fillText(String(Math.max(0,Math.ceil(S.time))).padStart(2,'0'),180,387); g.shadowBlur=0;
      const jx=cl((S.tx-(S.ptx??S.tx))*6,-10,10); S.ptx=S.tx; g.fillStyle='#0a0a0a'; g.beginPath(); g.ellipse(80,402,18,6,0,0,7); g.fill(); g.strokeStyle='#c0c4c8'; g.lineWidth=4; g.beginPath(); g.moveTo(80,400); g.lineTo(80+jx,380); g.stroke(); g.fillStyle='#c02838'; g.beginPath(); g.arc(80+jx,378,8,0,7); g.fill();
      const lit=(S.ph==='move'||S.ph==='carry')&&Math.floor(t*3)%2===0; g.fillStyle=lit?'#ffd040':'#806010'; if(lit){ g.shadowColor='#ffd040'; g.shadowBlur=12; } g.beginPath(); g.arc(285,390,13,0,7); g.fill(); g.shadowBlur=0; g.fillStyle='rgba(255,255,255,.4)'; g.beginPath(); g.arc(281,386,4,0,7); g.fill(); },
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
