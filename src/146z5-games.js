// THE GAMES: the insides' small games for the minigames' window (MINI): darts (301 on a real board), pool (rack, cue ball, pockets), the claw machine (a swinging head, a grip as good as your aim, carry it to the chute). Each GAMES.x(opts) gives a game; opts.end(S) gets the result.
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
}
export {GAMES};
