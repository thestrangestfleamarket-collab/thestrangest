// THE ARCADE'S GAMES: the six cabinets' games, each played in a cabinet window over the page (double-click a cabinet); a play costs $2 and trains the cabinet's skill by your score.
import {FORAGE, INV, keys, SFX} from './003b-systems.js';
import {STORE, SYS} from './006-map-pre.js';
STORE.cabs={tick:null,on:false};
SYS.add('places',dt=>{ if(STORE.cabs.tick)STORE.cabs.tick(dt); },'arcade games');
STORE.cabs.play=(name,skill)=>{ '@arcade'; const C=STORE.cabs; if(C.on)return;
  const W=256, H=224, R=Math.random, ri=n=>Math.floor(R()*n), cl=(v,a,b)=>Math.max(a,Math.min(b,v)), say=(t,c)=>FORAGE.say&&FORAGE.say(t,c);
  const tx=(c,s,x,y,col,sz=8,al='left')=>{ c.font=`bold ${sz}px monospace`; c.textAlign=al; c.textBaseline='top'; c.fillStyle='#000'; c.fillText(s,x+1,y+1); c.fillStyle=col; c.fillText(s,x,y); };
  const bmp=(c,rows,x,y,col,k=1)=>{ c.fillStyle=col; rows.forEach((r,j)=>{ for(let i=0;i<r.length;i++)if(r[i]==='#')c.fillRect(Math.round(x+i*k),Math.round(y+j*k),k,k); }); };
  const beep=(f,d=.08,ty='square',v=.06,f2)=>{ const a=SFX.live&&SFX.live(); if(!a||!SFX.on)return; const o=a.createOscillator(), g=a.createGain(), t=a.currentTime; o.type=ty; o.frequency.setValueAtTime(f,t); if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v*(SFX.vol??1),t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+d+.02); };
  const DIRS={L:[-1,0],R:[1,0],U:[0,-1],D:[0,1]}, OPP={L:'R',R:'L',U:'D',D:'U'};
  const mv=(e,sp,ok,wrap)=>{ if(e.pick&&!e.d)e.pick(e); if(e.n&&e.d&&e.n===OPP[e.d]){ const v=DIRS[e.d]; e.x+=v[0]; e.y+=v[1]; if(wrap)e.x=(e.x+wrap)%wrap; e.t=1-e.t; e.d=e.n; }
    if(!e.d){ if(e.n&&ok(e.x+DIRS[e.n][0],e.y+DIRS[e.n][1]))e.d=e.n; else return; }
    e.t+=sp; while(e.t>=1){ const v=DIRS[e.d]; e.x+=v[0]; e.y+=v[1]; if(wrap)e.x=(e.x+wrap)%wrap; e.t-=1; if(e.pick)e.pick(e);
      if(e.n&&ok(e.x+DIRS[e.n][0],e.y+DIRS[e.n][1]))e.d=e.n; else if(!ok(e.x+DIRS[e.d][0],e.y+DIRS[e.d][1])){ e.t=0; e.d=null; return; } } };
  const at=e=>e.d?[e.x+DIRS[e.d][0]*e.t,e.y+DIRS[e.d][1]*e.t]:[e.x,e.y];
  const held=K=>K.L?'L':K.R?'R':K.U?'U':K.D?'D':null;

  const blocks={ help:['← → MOVE   ↑ TURN','↓ DROP   SPACE SLAM'], grade:[400,1500,4000], make:()=>{
    const P=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
    const B=Array.from({length:20},()=>Array(10).fill(0)), s={B,score:0,lines:0,lv:0,over:false,t:0,das:0,nx:ri(7),fl:0};
    const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
    const fits=(m,x,y)=>m.every((r,j)=>r.every((v,i)=>!v||(x+i>=0&&x+i<10&&y+j<20&&(y+j<0||!B[y+j][x+i]))));
    const spawn=()=>{ const k=s.nx; s.nx=ri(7); s.p={m:P[k],k,x:k===1?4:3,y:0}; if(!fits(s.p.m,s.p.x,s.p.y))s.over=true; };
    const lock=()=>{ const p=s.p; p.m.forEach((r,j)=>r.forEach((v,i)=>{ if(v){ if(p.y+j<0)s.over=true; else B[p.y+j][p.x+i]=p.k+1; } }));
      let n=0; for(let y=19;y>=0;y--)if(B[y].every(v=>v)){ B.splice(y,1); n++; } for(let i=0;i<n;i++)B.unshift(Array(10).fill(0));
      if(n){ s.score+=[0,100,300,500,800][n]*(s.lv+1); s.lines+=n; s.lv=Math.floor(s.lines/10); s.fl=.15; beep(520+n*120,.15,'square',.07,1040); } else beep(140,.05,'triangle',.08);
      if(!s.over)spawn(); };
    spawn();
    s.step=(dt,K,T)=>{ const p=s.p; s.fl=Math.max(0,s.fl-dt);
      if(T.U){ const m=rot(p.m); for(const k of [0,-1,1,-2,2])if(fits(m,p.x+k,p.y)){ p.m=m; p.x+=k; beep(660,.03); break; } }
      const mx=d=>{ if(fits(p.m,p.x+d,p.y))p.x+=d; };
      if(T.L){ mx(-1); s.das=.17; } else if(T.R){ mx(1); s.das=.17; } else if(K.L||K.R){ s.das-=dt; if(s.das<=0){ mx(K.L?-1:1); s.das=.05; } }
      if(T.F){ while(fits(p.m,p.x,p.y+1)){ p.y++; s.score+=2; } lock(); return; }
      s.t+=dt; const iv=K.D?.04:Math.max(.07,.8-s.lv*.07); while(s.t>=iv){ s.t-=iv; if(fits(p.m,p.x,p.y+1)){ p.y++; if(K.D)s.score++; } else { lock(); break; } } };
    s.draw=c=>{ const ox=78, oy=12, Q=10, COL=['#3cf0ff','#ffe83c','#a46bff','#2a7bff','#ff8a2a','#5aff6a','#ff3c5a'];
      c.fillStyle='#0b0814'; c.fillRect(ox-2,oy-2,Q*10+4,Q*20+4); c.fillStyle=s.fl>0?'#3a2a50':'#05040a'; c.fillRect(ox,oy,Q*10,Q*20);
      c.fillStyle='#120f1e'; for(let i=1;i<10;i++)c.fillRect(ox+i*Q,oy,1,Q*20); for(let j=1;j<20;j++)c.fillRect(ox,oy+j*Q,Q*10,1);
      const cell=(x,y,k,a)=>{ if(y<0)return; c.globalAlpha=a; c.fillStyle=COL[k]; c.fillRect(ox+x*Q,oy+y*Q,Q-1,Q-1); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(ox+x*Q,oy+y*Q,Q-1,2); c.globalAlpha=1; };
      B.forEach((r,y)=>r.forEach((v,x)=>v&&cell(x,y,v-1,1)));
      const p=s.p; if(p&&!s.over){ let gy=p.y; while(fits(p.m,p.x,gy+1))gy++; p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,gy+j,p.k,.25))); p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,p.y+j,p.k,1))); }
      tx(c,'SCORE',8,20,'#ff8a2a'); tx(c,String(s.score),8,30,'#fff'); tx(c,'LINES',8,50,'#ff8a2a'); tx(c,String(s.lines),8,60,'#fff'); tx(c,'LEVEL',8,80,'#ff8a2a'); tx(c,String(s.lv+1),8,90,'#fff');
      tx(c,'NEXT',190,20,'#ff8a2a'); P[s.nx].forEach((r,j)=>r.forEach((v,i)=>{ if(v){ c.fillStyle=COL[s.nx]; c.fillRect(192+i*9,36+j*9,8,8); } })); };
    return s; } };

  const raid={ help:['← → MOVE','SPACE FIRE'], grade:[500,1500,3000], make:()=>{
    const SQ=[['...##...','..####..','.######.','##.##.##','########','..#..#..','.#.##.#.','#.#..#.#'],['...##...','..####..','.######.','##.##.##','########','.#.##.#.','#......#','.#....#.']];
    const CR=[['..#.....#..','...#...#...','..#######..','.##.###.##.','###########','#.#######.#','#.#.....#.#','...##.##...'],['..#.....#..','#..#...#..#','#.#######.#','###.###.###','###########','.#########.','..#.....#..','.#.......#.']];
    const SHIP=['......#......','.....###.....','.###########.','#############','#############'];
    const s={x:128,lives:3,score:0,wave:1,al:[],b:null,eb:[],dir:1,ft:1.5,dead:0,an:0,sh:[],over:false,mt:0};
    const wave=()=>{ s.al=[]; for(let r=0;r<5;r++)for(let c=0;c<9;c++)s.al.push({x:32+c*20,y:30+r*14+Math.min(s.wave-1,4)*6,r}); s.dir=1; s.eb=[]; s.b=null; s.ft=1.5; };
    s.sh=[]; for(const bx of [44,100,156,212])for(let j=0;j<4;j++)for(let i=0;i<6;i++)if(!(j===3&&(i===2||i===3)))s.sh.push({x:bx-12+i*4,y:172+j*4});
    const shHit=(x,y)=>{ const k=s.sh.findIndex(q=>x>=q.x-1&&x<q.x+5&&y>=q.y&&y<q.y+4); if(k<0)return false; s.sh.splice(k,1); return true; };
    wave();
    s.step=(dt,K,T)=>{ s.an+=dt;
      if(s.dead>0){ s.dead-=dt; if(s.dead<=0&&s.lives<=0)s.over=true; return; }
      if(K.L)s.x-=100*dt; if(K.R)s.x+=100*dt; s.x=cl(s.x,10,246);
      if((T.F||K.F)&&!s.b){ s.b={x:s.x,y:198}; beep(880,.07,'square',.04,440); }
      if(s.b){ s.b.y-=240*dt; if(s.b.y<10)s.b=null; else if(shHit(s.b.x,s.b.y))s.b=null;
        else for(let i=0;i<s.al.length;i++){ const a=s.al[i]; if(Math.abs(s.b.x-a.x)<7&&Math.abs(s.b.y-a.y)<5){ s.score+=[30,20,20,10,10][a.r]; s.al.splice(i,1); s.b=null; beep(220,.12,'sawtooth',.06,60); break; } } }
      const n=s.al.length; if(!n){ s.wave++; wave(); return; }
      const sp=10+(45-n)*1.6+s.wave*4; let edge=false; for(const a of s.al){ a.x+=s.dir*sp*dt; if(a.x>244||a.x<12)edge=true; }
      s.mt+=dt*sp/20; if(s.mt>1){ s.mt=0; beep(70+((s.an*4|0)%4)*10,.05,'square',.05); }
      if(edge){ s.dir*=-1; for(const a of s.al){ a.y+=6; a.x=cl(a.x,12,244); if(a.y>=190)s.lives=0; } if(s.lives<=0){ s.dead=.6; return; } }
      for(const a of s.al)shHit(a.x,a.y+3);
      s.ft-=dt; if(s.ft<=0){ s.ft=Math.max(.3,1.1-s.wave*.1)*(.6+R()*.8); const a=s.al[ri(n)], low=s.al.filter(q=>Math.abs(q.x-a.x)<3).reduce((m,q)=>q.y>m.y?q:m,a); s.eb.push({x:low.x,y:low.y+6}); }
      for(let i=s.eb.length-1;i>=0;i--){ const e=s.eb[i]; e.y+=100*dt; if(e.y>224||shHit(e.x,e.y)){ s.eb.splice(i,1); continue; }
        if(Math.abs(e.x-s.x)<7&&e.y>200&&e.y<212){ s.eb.splice(i,1); s.lives--; s.dead=1.2; s.eb=[]; beep(110,.5,'sawtooth',.08,40); break; } } };
    s.draw=c=>{ c.fillStyle='#04030a'; c.fillRect(0,0,W,H); for(let i=0;i<40;i++){ c.fillStyle=i%3?'#2a2440':'#5a5080'; c.fillRect((i*73)%W,(i*131+s.an*6)%H,1,1); }
      const fr=Math.floor(s.an*2)%2, COLS=['#ff4fd8','#4ff0ff','#4ff0ff','#5aff6a','#5aff6a'];
      for(const a of s.al){ const sp=a.r===0?SQ[fr]:CR[fr]; bmp(c,sp,a.x-sp[0].length/2,a.y-4,COLS[a.r]); }
      c.fillStyle='#5aff6a'; for(const q of s.sh)c.fillRect(q.x,q.y,4,4);
      if(s.dead<=0||Math.floor(s.dead*10)%2)bmp(c,SHIP,s.x-6,202,'#ffe83c');
      c.fillStyle='#fff'; if(s.b)c.fillRect(s.b.x,s.b.y,1,5); c.fillStyle='#ff8a2a'; for(const e of s.eb)c.fillRect(e.x-1,e.y,2,5);
      c.fillStyle='#5aff6a'; c.fillRect(0,214,W,1); tx(c,'SCORE '+s.score,6,2,'#fff'); tx(c,'WAVE '+s.wave,128,2,'#ff7ad8',8,'center');
      for(let i=0;i<s.lives;i++)bmp(c,SHIP,200+i*16,216,'#ffe83c',.6); };
    return s; } };

  const MAZE=['###################','#........#........#','#o##.###.#.###.##o#','#.................#','#.##.#.#####.#.##.#','#....#...#...#....#','####.### # ###.####','   #.#       #.#   ','####.# ##-## #.####','    .  #   #  .    ','####.# ##### #.####','   #.#       #.#   ','####.# ##### #.####','#........#........#','#.##.###.#.###.##.#','#o.#.....P.....#.o#','##.#.#.#####.#.#.##','#....#...#...#....#','#.######.#.######.#','#.................#','###################'];
  const maze={ help:['ARROWS MOVE','EAT EVERY DOT'], grade:[1000,3000,6000], make:()=>{
    const MW=19, MH=21, s={score:0,lives:3,lv:0,over:false,pw:0,chain:0,t:0,wait:1.5,dead:0};
    const wall=(x,y)=>{ x=((x%MW)+MW)%MW; return y<0||y>=MH||'#-'.includes(MAZE[y][x]); }, ok=(x,y)=>!wall(x,y);
    let dots=new Map(); const fill=()=>{ dots=new Map(); MAZE.forEach((r,y)=>[...r].forEach((ch,x)=>{ if(ch==='.'||ch==='o')dots.set(x+','+y,ch); })); };
    const GC=['#ff3c5a','#ffb8ff','#3cf0ff','#ffb852'], pac={};
    const gh=GC.map((col,i)=>({col,i}));
    const reset=()=>{ Object.assign(pac,{x:9,y:15,t:0,d:null,n:null}); gh.forEach((g,i)=>Object.assign(g,{x:9,y:7,t:0,d:null,n:null,pen:i*2.5,fr:0,pick:pick})); s.pw=0; s.wait=1.2; };
    const pick=g=>{ const [px,py]=at(pac), opts=['U','L','D','R'].filter(d=>d!==OPP[g.d]&&ok(g.x+DIRS[d][0],g.y+DIRS[d][1]));
      if(!opts.length){ g.n=g.d?OPP[g.d]:null; return; } if(s.pw>0||(g.i===3&&R()<.5)||R()<.08){ g.n=opts[ri(opts.length)]; return; }
      let tx_=px, ty_=py; if(g.i===1&&pac.d){ tx_+=DIRS[pac.d][0]*4; ty_+=DIRS[pac.d][1]*4; } if(g.i===2&&Math.hypot(px-g.x,py-g.y)<6){ tx_=0; ty_=20; }
      g.n=opts.reduce((b,d)=>{ const q=Math.hypot(g.x+DIRS[d][0]-tx_,g.y+DIRS[d][1]-ty_); return q<b[0]?[q,d]:b; },[1e9,opts[0]])[1]; };
    fill(); reset();
    s.step=(dt,K,T)=>{ s.t+=dt; if(s.dead>0){ s.dead-=dt; if(s.dead<=0){ if(s.lives<=0)s.over=true; else reset(); } return; }
      if(s.wait>0){ s.wait-=dt; return; } const h=held(K); if(h)pac.n=h; const sp=1+s.lv*.06;
      mv(pac,6.5*sp*dt,ok,MW); const k=pac.x+','+pac.y, dt_=dots.get(k);
      if(dt_&&pac.t<.5){ dots.delete(k); if(dt_==='o'){ s.score+=50; s.pw=6; s.chain=0; beep(300,.25,'square',.06,900); } else { s.score+=10; beep(s.t*30%2<1?500:420,.03,'square',.03); } }
      if(!dots.size){ s.lv++; s.score+=500; fill(); reset(); return; }
      s.pw=Math.max(0,s.pw-dt); const [px,py]=at(pac);
      for(const g of gh){ if(g.pen>0){ g.pen-=dt; continue; } mv(g,(s.pw>0?3.6:6*sp)*dt,ok,MW); const [gx,gy]=at(g);
        if(Math.hypot(gx-px,gy-py)<.7){ if(s.pw>0){ s.chain++; s.score+=200*2**(s.chain-1); Object.assign(g,{x:9,y:7,t:0,d:null,n:null,pen:3}); beep(900,.2,'square',.06,200); }
          else { s.lives--; s.dead=1.5; beep(500,1,'sawtooth',.07,60); return; } } } };
    s.draw=c=>{ const Q=10, ox=33, oy=12; c.fillStyle='#000'; c.fillRect(0,0,W,H);
      MAZE.forEach((r,y)=>[...r].forEach((ch,x)=>{ if(ch==='#'){ c.fillStyle='#14206a'; c.fillRect(ox+x*Q,oy+y*Q,Q,Q); c.fillStyle='#2a7bff';
          if(!wall(x,y-1))c.fillRect(ox+x*Q,oy+y*Q,Q,2); if(!wall(x,y+1))c.fillRect(ox+x*Q,oy+y*Q+Q-2,Q,2); if(!wall(x-1,y))c.fillRect(ox+x*Q,oy+y*Q,2,Q); if(!wall(x+1,y))c.fillRect(ox+x*Q+Q-2,oy+y*Q,2,Q); }
        else if(ch==='-'){ c.fillStyle='#ffb8ff'; c.fillRect(ox+x*Q,oy+y*Q+4,Q,2); } }));
      for(const [k,ch] of dots){ const [x,y]=k.split(',').map(Number); c.fillStyle='#ffd8b0'; if(ch==='o'){ if(Math.floor(s.t*4)%2){ c.beginPath(); c.arc(ox+x*Q+5,oy+y*Q+5,3.5,0,7); c.fill(); } } else c.fillRect(ox+x*Q+4,oy+y*Q+4,2,2); }
      const [px,py]=at(pac), mo=s.dead>0?Math.PI*(1-s.dead/1.5):(.1+.25*Math.abs(Math.sin(s.t*12)))*Math.PI, an={R:0,D:Math.PI/2,L:Math.PI,U:-Math.PI/2}[pac.d||pac.n||'L'];
      c.fillStyle='#ffe83c'; c.beginPath(); c.moveTo(ox+px*Q+5,oy+py*Q+5); c.arc(ox+px*Q+5,oy+py*Q+5,4.6,an+mo,an+2*Math.PI-mo); c.fill();
      if(s.dead<=0)for(const g of gh){ const [gx,gy]=g.pen>0?[8+g.i%3,9]:at(g), X_=ox+gx*Q+5, Y_=oy+gy*Q+5, fr=s.pw>0&&!(s.pw<2&&Math.floor(s.t*6)%2);
        c.fillStyle=fr?'#2a3cff':g.col; c.beginPath(); c.arc(X_,Y_-1,4.6,Math.PI,0); c.lineTo(X_+4.6,Y_+4.5); for(let i=0;i<4;i++)c.lineTo(X_+4.6-(i+.5)*2.3,Y_+(i%2?4.5:2.5)); c.lineTo(X_-4.6,Y_+4.5); c.fill();
        c.fillStyle='#fff'; c.fillRect(X_-3,Y_-3,2,3); c.fillRect(X_+1,Y_-3,2,3); }
      tx(c,'SCORE',229,14,'#ffe83c',7); tx(c,String(s.score),229,24,'#fff',7); tx(c,'LIVES',229,44,'#ffe83c',7); tx(c,String(Math.max(0,s.lives)),229,54,'#fff',7);
      if(s.wait>0&&s.dead<=0)tx(c,'READY!',ox+95,oy+9*Q+1,'#ffe83c',8,'center'); };
    return s; } };

  const road={ help:['↑ / SPACE GAS   ↓ BRAKE','← → STEER'], grade:[1500,4000,8000], make:()=>{
    const N=600, SL=200, RW=2000, CH=1000, DD=.84, VIS=140, MAX=SL*60, PZ=CH*DD, L=N*SL, segs=[];
    while(segs.length<N){ const n=40+ri(60), c=R()<.35?0:(R()*2-1)*4; for(let i=0;i<n;i++)segs.push({c:c*Math.sin(Math.PI*i/n)}); } segs.length=N; segs.forEach((g,i)=>{ g.i=i; g.k=Math.floor(i/3)%2; });
    const CC=['#3cf0ff','#ffe83c','#5aff6a','#ff8a2a','#a46bff','#ffffff'], cars=Array.from({length:16},()=>({z:2000+R()*(L-4000),x:R()*1.5-.75,sp:MAX*(.25+R()*.3),col:CC[ri(6)]}));
    let K_={}; const s={pz:0,x:0,sp:0,time:40,dist:0,score:0,bg:0,lap:0,msg:0,over:false,bump:0};
    s.step=(dt,K,T)=>{ K_=K; const seg=segs[Math.floor((s.pz+PZ)/SL)%N], pc=s.sp/MAX, dx=dt*2*pc;
      if(K.L)s.x-=dx; if(K.R)s.x+=dx; s.x-=dx*pc*seg.c*.2;
      if(s.time>0&&(K.U||K.F))s.sp+=MAX/4*dt; else if(K.D)s.sp-=MAX*dt; else s.sp-=MAX/5*dt;
      if(Math.abs(s.x)>1&&s.sp>MAX/4)s.sp-=MAX/1.2*dt; s.x=cl(s.x,-2.2,2.2); s.sp=cl(s.sp,0,MAX);
      for(const c of cars)c.z=(c.z+c.sp*dt)%L; s.bump=Math.max(0,s.bump-dt);
      for(const c of cars){ const dz=((c.z-(s.pz+PZ))%L+L)%L; if(dz<SL&&Math.abs(c.x-s.x)<.3&&s.sp>c.sp){ s.sp=c.sp*.5; s.pz=((c.z-PZ-SL)%L+L)%L; s.bump=.4; beep(90,.25,'sawtooth',.08,40); } }
      const lap=Math.floor((s.pz+s.sp*dt)/L); s.pz=(s.pz+s.sp*dt)%L; s.dist+=s.sp*dt; s.score=Math.floor(s.dist/100); s.bg+=seg.c*pc*dt*14;
      if(lap>0&&s.time>0){ s.time+=15; s.msg=2; s.lap++; beep(660,.4,'square',.06,1320); }
      s.time=Math.max(0,s.time-dt); s.msg=Math.max(0,s.msg-dt); if(s.time<=0&&s.sp<=0)s.over=true;
      if(s.sp>0&&Math.random()<dt*8)beep(60+pc*140,.06,'sawtooth',.012); };
    s.draw=c=>{ const g=c.createLinearGradient(0,0,0,H/2); g.addColorStop(0,'#1a0838'); g.addColorStop(.7,'#7a1a78'); g.addColorStop(1,'#ff3ca8'); c.fillStyle=g; c.fillRect(0,0,W,H/2);
      const sx=((128-s.bg*.3)%W+W)%W; c.fillStyle='#ffd23c'; c.beginPath(); c.arc(sx,H/2-4,30,Math.PI,0); c.fill(); c.fillStyle='#ff8a2a'; c.beginPath(); c.arc(sx,H/2-4,30,Math.PI,Math.PI*1.5,true); c.fill();
      c.fillStyle='#7a1a78'; for(let i=0;i<5;i++)c.fillRect(sx-31,H/2-6-i*5,62,1+i*.4);
      for(const [sp,col,hh] of [[.6,'#3a0c50',22],[1,'#22062e',14]]){ c.fillStyle=col; c.beginPath(); c.moveTo(0,H/2); for(let x=0;x<=W;x+=4){ const q=x+s.bg*sp+hh*40; c.lineTo(x,H/2-hh*(.55+.3*Math.sin(q*.031)+.15*Math.sin(q*.083))); } c.lineTo(W,H/2); c.fill(); }
      c.fillStyle='#120626'; c.fillRect(0,H/2,W,H/2);
      const base=Math.floor(s.pz/SL), bp=(s.pz%SL)/SL, camX=s.x*RW; let x=0, dx=-(segs[base%N].c*bp), maxy=H;
      const P=(z,xx)=>{ const sc=DD/z; return [W/2+sc*(xx-camX)*W/2,H/2+sc*CH*H/2,sc*RW*W/2]; }, quad=(col,x1,y1,w1,x2,y2,w2)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(x1-w1,y1); c.lineTo(x2-w2,y2); c.lineTo(x2+w2,y2); c.lineTo(x1+w1,y1); c.fill(); };
      const vis=[];
      for(let n=0;n<VIS;n++){ const sg=segs[(base+n)%N], z0=n*SL-bp*SL, z1=z0+SL, a=P(z0,x), b=P(z1,x+dx); x+=dx; dx+=sg.c; sg.vis=false;
        if(z0<=DD||b[1]>=maxy)continue; sg.vis=true; sg.sx=a[0]; sg.sy=a[1]; sg.sc=DD/z0; vis.push(sg);
        c.fillStyle=sg.k?'#2a0a3a':'#1a0628'; c.fillRect(0,b[1],W,a[1]-b[1]+1);
        quad(sg.k?'#ff3ca8':'#ffffff',a[0],a[1],a[2]*1.12,b[0],b[1],b[2]*1.12); quad(sg.k?'#2a2838':'#302e40',a[0],a[1],a[2],b[0],b[1],b[2]);
        if(sg.k)for(const l of [-1/3,1/3])quad('#e8e0ff',a[0]+a[2]*l,a[1],a[2]*.02,b[0]+b[2]*l,b[1],b[2]*.02); maxy=b[1]; }
      const by=new Map(); for(const car of cars){ const i=Math.floor(car.z/SL); if(!by.has(i))by.set(i,[]); by.get(i).push(car); }
      for(let k=vis.length-1;k>=0;k--){ const sg=vis[k]; for(const car of by.get(sg.i)||[]){ const w=sg.sc*RW*W/2*.28, h=w*.55, X_=sg.sx+sg.sc*car.x*RW*W/2; if(w<1.5)continue;
        c.fillStyle=car.col; c.fillRect(X_-w/2,sg.sy-h,w,h*.7); c.fillStyle='#14101e'; c.fillRect(X_-w*.35,sg.sy-h*1.25,w*.7,h*.6); c.fillStyle='#ff2a2a'; c.fillRect(X_-w/2,sg.sy-h*.55,w*.18,h*.15); c.fillRect(X_+w*.32,sg.sy-h*.55,w*.18,h*.15); c.fillStyle='#000'; c.fillRect(X_-w*.45,sg.sy-h*.3,w*.2,h*.3); c.fillRect(X_+w*.25,sg.sy-h*.3,w*.2,h*.3); } }
      const cx=W/2+(s.bump>0?(R()-.5)*4:0)+(K_.L?-2:K_.R?2:0), cy=H-4;
      c.fillStyle='#000'; c.fillRect(cx-30,cy-10,12,10); c.fillRect(cx+18,cy-10,12,10); c.fillStyle='#ff3c5a'; c.fillRect(cx-32,cy-22,64,14); c.fillStyle='#c01a3a'; c.fillRect(cx-26,cy-32,52,11);
      c.fillStyle='#1a1430'; c.fillRect(cx-22,cy-31,44,8); c.fillStyle='#ffe83c'; c.fillRect(cx-30,cy-19,10,4); c.fillRect(cx+20,cy-19,10,4); c.fillStyle='#fff'; c.fillRect(cx-6,cy-17,12,4);
      tx(c,'SCORE '+s.score,6,4,'#fff'); tx(c,'TIME',128,2,'#ffe83c',8,'center'); tx(c,String(Math.ceil(s.time)),128,11,s.time<10&&Math.floor(s.time*4)%2?'#ff3c5a':'#ffe83c',14,'center');
      tx(c,Math.round(s.sp/MAX*285)+' KM/H',250,4,'#3cf0ff',8,'right'); if(s.msg>0)tx(c,'CHECKPOINT  +15',128,60,'#5aff6a',10,'center');
      if(s.time<=0)tx(c,'TIME UP',128,80,'#ff3c5a',16,'center'); };
    return s; } };

  const pong={ help:['↑ ↓ MOVE','FIRST TO 7'], grade:[300,700,1500], make:()=>{
    const s={y:112,cy:112,b:{x:128,y:112,vx:-120,vy:40},me:0,cpu:0,score:0,over:false,serve:1,win:false};
    const serve=d=>{ Object.assign(s.b,{x:128,y:60+R()*104,vx:d*125,vy:(R()*2-1)*70}); s.serve=1; };
    s.step=(dt,K,T)=>{ if(K.U)s.y-=150*dt; if(K.D)s.y+=150*dt; s.y=cl(s.y,22,202);
      const b=s.b; if(s.serve>0){ s.serve-=dt; return; }
      const tgt=b.vx>0?b.y:112; s.cy+=cl(tgt-s.cy,-125*dt,125*dt); s.cy=cl(s.cy,22,202);
      b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<10){ b.y=10; b.vy*=-1; beep(300,.03); } if(b.y>210){ b.y=210; b.vy*=-1; beep(300,.03); }
      const hit=(px,py,dir)=>{ if(Math.abs(b.x-px)<4&&Math.abs(b.y-py)<16&&Math.sign(b.vx)===-dir){ const sp=Math.min(320,Math.hypot(b.vx,b.vy)*1.06); const a=(b.y-py)/16*1.05; b.vx=dir*sp*Math.cos(a); b.vy=sp*Math.sin(a); b.x=px+dir*4; beep(dir>0?480:360,.04); } };
      hit(14,s.y,1); hit(242,s.cy,-1);
      if(b.x<0){ s.cpu++; beep(150,.3,'square',.06,80); if(s.cpu>=7)s.over=true; else serve(1); }
      if(b.x>W){ s.me++; s.score+=100; beep(800,.2,'square',.06,1200); if(s.me>=7){ s.win=true; s.score+=1000; s.over=true; } else serve(-1); } };
    s.draw=c=>{ c.fillStyle='#05060c'; c.fillRect(0,0,W,H); c.fillStyle='#2a7bff'; c.fillRect(0,0,W,4); c.fillRect(0,220,W,4); c.fillStyle='#e8f0ff'; for(let y=8;y<H;y+=12)c.fillRect(127,y,2,6);
      tx(c,String(s.me),96,12,'#e8f0ff',24,'center'); tx(c,String(s.cpu),160,12,'#e8f0ff',24,'center');
      c.fillRect(10,s.y-14,4,28); c.fillRect(242,s.cy-14,4,28); if(s.serve<=0||Math.floor(s.serve*8)%2)c.fillRect(s.b.x-2,s.b.y-2,4,4); if(s.win)tx(c,'YOU WIN',128,100,'#5aff6a',16,'center'); };
    return s; } };

  const taksi={ help:['ARROWS DRIVE','PICK UP, DROP OFF'], grade:[30,90,180], make:()=>{
    const GW=16, GH=13, Q=16, OY=16, road=(x,y)=>x>=0&&y>=0&&x<GW&&y<GH&&(x%3===0||y%3===0);
    const s={score:0,time:60,over:false,cool:0,msg:'',mt:0,fl:0,t:0}, taxi={x:6,y:6,t:0,d:null,n:'R'};
    const spot=(fx,fy,m)=>{ for(let k=0;k<200;k++){ const x=ri(GW), y=ri(GH); if(road(x,y)&&Math.abs(x-fx)+Math.abs(y-fy)>=m)return [x,y]; } return [0,0]; };
    s.pas=spot(6,6,6); s.dst=null;
    const cars=Array.from({length:5},(_,i)=>({x:[0,15,9,3,12][i],y:[0,12,3,9,6][i],t:0,d:null,n:null,col:['#e8e8f0','#3c6aff','#ff3c5a','#5aff6a','#a46bff'][i]}));
    for(const c of cars)c.pick=e=>{ const o=['U','L','D','R'].filter(d=>d!==OPP[e.d]&&road(e.x+DIRS[d][0],e.y+DIRS[d][1])); e.n=o.length?o[ri(o.length)]:OPP[e.d]; };
    const BC=['#c8643c','#e8c89a','#b04a5a','#d8a050','#8a6aa0','#f0e0c0','#6a8ab0','#c0503a'];
    s.step=(dt,K,T)=>{ s.t+=dt; const h=held(K); if(h)taxi.n=h; s.cool=Math.max(0,s.cool-dt); s.mt=Math.max(0,s.mt-dt);
      mv(taxi,5*dt,road); for(const c of cars)mv(c,3*dt,road); const [tx_,ty_]=at(taxi);
      for(const c of cars){ const [cx,cy]=at(c); if(s.cool<=0&&Math.hypot(cx-tx_,cy-ty_)<.75){ s.cool=1; s.time=Math.max(0,s.time-3); if(taxi.d)taxi.n=OPP[taxi.d]; s.msg='CRASH! -3s'; s.mt=1; beep(120,.3,'sawtooth',.08,50); } }
      if(!s.dst&&Math.hypot(s.pas[0]-tx_,s.pas[1]-ty_)<.5){ s.dst=spot(s.pas[0],s.pas[1],9); s.msg='TAKE ME THERE!'; s.mt=1.5; beep(700,.12,'square',.05,1100); }
      else if(s.dst&&Math.hypot(s.dst[0]-tx_,s.dst[1]-ty_)<.5){ const f=5+Math.abs(s.dst[0]-s.pas[0])+Math.abs(s.dst[1]-s.pas[1]); s.score+=f; s.time+=10; s.msg='FARE $'+f+'  +10s'; s.mt=1.5; s.pas=spot(s.dst[0],s.dst[1],6); s.dst=null; beep(900,.3,'square',.06,1800); }
      s.time=Math.max(0,s.time-dt); if(s.time<=0)s.over=true; };
    s.draw=c=>{ c.fillStyle='#3a3a44'; c.fillRect(0,OY,W,H-OY);
      for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){ if(road(x,y)){ if(x%3===0&&y%3===0)continue; c.fillStyle='#d8d0b0'; if(x%3===0&&y%2)c.fillRect(x*Q+7,OY+y*Q+2,2,10); if(y%3===0&&x%2)c.fillRect(x*Q+2,OY+y*Q+7,10,2); continue; }
        if(x%3===1&&y%3===1){ const col=BC[(x*7+y*13)%BC.length]; c.fillStyle='#22202a'; c.fillRect(x*Q+1,OY+y*Q+1,2*Q-2,2*Q-2); c.fillStyle=col; c.fillRect(x*Q+2,OY+y*Q+2,2*Q-5,2*Q-5);
          c.fillStyle='rgba(0,0,0,.25)'; for(let j=0;j<3;j++)for(let i=0;i<3;i++)c.fillRect(x*Q+6+i*8,OY+y*Q+6+j*8,4,4); if((x+y)%4===0){ c.fillStyle='#4a8a4a'; c.beginPath(); c.arc(x*Q+16,OY+y*Q+16,5,0,7); c.fill(); } } }
      const pin=(p,col)=>{ const X_=p[0]*Q+8, Y_=OY+p[1]*Q+8; c.fillStyle=col; c.beginPath(); c.arc(X_,Y_-3,4,0,7); c.fill(); c.fillRect(X_-1,Y_,2,6); };
      if(!s.dst){ if(Math.floor(s.t*4)%2){ const X_=s.pas[0]*Q+8, Y_=OY+s.pas[1]*Q+8; c.fillStyle='#ffd8b0'; c.fillRect(X_-1,Y_-6,3,3); c.fillStyle='#ff3ca8'; c.fillRect(X_-2,Y_-3,5,6); c.fillStyle='#fff'; c.fillRect(X_+3,Y_-7,1,4); } }
      else pin(s.dst,Math.floor(s.t*4)%2?'#5aff6a':'#ffe83c');
      const car=(e,col,taxiOn)=>{ const [x,y]=at(e), d=e.d||e.n||'R', hz=d==='L'||d==='R', w=hz?12:8, h=hz?8:12, X_=x*Q+8, Y_=OY+y*Q+8; c.fillStyle='#000'; c.fillRect(X_-w/2,Y_-h/2+1,w,h);
        c.fillStyle=col; c.fillRect(X_-w/2,Y_-h/2,w,h); c.fillStyle='#1a2030'; if(hz)c.fillRect(X_+(d==='R'?1:-4),Y_-3,3,6); else c.fillRect(X_-3,Y_+(d==='D'?1:-4),6,3);
        if(taxiOn){ c.fillStyle='#141016'; for(let i=0;i<3;i++)if(hz)c.fillRect(X_-5+i*2,Y_-4+(i%2)*2,1,2); else c.fillRect(X_-4+(i%2)*2,Y_-5+i*2,2,1); } };
      for(const e of cars)car(e,e.col); if(s.cool<=0||Math.floor(s.cool*10)%2)car(taxi,'#ffd21c',1);
      c.fillStyle='#141016'; c.fillRect(0,0,W,OY); tx(c,'FARES $'+s.score,4,4,'#ffd21c'); tx(c,'TIME '+Math.ceil(s.time),128,4,s.time<10?'#ff3c5a':'#fff',8,'center');
      const g=s.dst||s.pas, [tx_,ty_]=at(taxi), a=Math.atan2(g[1]-ty_,g[0]-tx_); tx(c,s.dst?'DROP OFF':'PICK UP',236,4,s.dst?'#5aff6a':'#ff3ca8',8,'right');
      c.save(); c.translate(246,8); c.rotate(a); c.fillStyle='#fff'; c.beginPath(); c.moveTo(6,0); c.lineTo(-4,-4); c.lineTo(-4,4); c.fill(); c.restore();
      if(s.mt>0)tx(c,s.msg,128,100,'#fff',10,'center'); };
    return s; } };

  const GAMES={'RAINBOW RUN':blocks,'GALAXY RAID':raid,'MAZE':maze,'ROAD 85':road,'TELEMAK':pong,'ISTANBUL TAKSI':taksi}, G=GAMES[name]; if(!G)return;
  const box=document.createElement('div'); box.id='cabwin';
  box.style.cssText='position:fixed;inset:0;z-index:40;background:rgba(4,2,8,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font:bold 13px monospace;color:#fff;user-select:none;touch-action:none';
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H; cv.style.cssText='image-rendering:pixelated;width:min(94vw,calc((100vh - 150px)*256/224));aspect-ratio:256/224;border:6px solid #241a30;border-radius:6px;box-shadow:0 0 40px rgba(255,60,168,.35)';
  const top=document.createElement('div'); top.textContent=name; top.style.cssText='font-size:20px;letter-spacing:3px;color:#ff7ad8;text-shadow:0 0 10px #ff3ca8';
  const foot=document.createElement('div'); foot.style.cssText='color:#a090c0;font-size:12px'; foot.textContent='SPACE TO START · ESC TO LEAVE';
  box.append(top,cv,foot); const c=cv.getContext('2d');
  const K={L:0,R:0,U:0,D:0,F:0}, T={}, map=k=>({arrowleft:'L',a:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',arrowdown:'D',s:'D',' ':'F',enter:'F',z:'F',x:'F'})[k];
  if(matchMedia('(pointer:coarse)').matches){ const pad=document.createElement('div'); pad.style.cssText='display:flex;gap:10px';
    for(const [k,l] of [['L','◀'],['U','▲'],['D','▼'],['R','▶'],['F','●'],['X','✕']]){ const b=document.createElement('button'); b.textContent=l; b.style.cssText='width:52px;height:46px;font-size:20px;background:#241a30;color:#fff;border:2px solid #5a3a70;border-radius:8px';
      b.onpointerdown=e=>{ e.preventDefault(); if(k==='X')return close(); if(!K[k])T[k]=1; K[k]=1; }; b.onpointerup=b.onpointerleave=()=>{ if(k!=='X')K[k]=0; }; pad.append(b); } box.append(pad); }
  const kd=e=>{ e.stopPropagation(); const k=(e.key||'').toLowerCase(); if(k==='escape'){ e.preventDefault(); close(); return; } const m=map(k); if(!m)return; e.preventDefault(); if(!e.repeat&&!K[m])T[m]=1; K[m]=1; };
  const ku=e=>{ e.stopPropagation(); const m=map((e.key||'').toLowerCase()); if(m)K[m]=0; };
  let mode='title', g=null, wait=0, msg='', best=0;
  const coin=()=>{ if(INV.cash<2){ msg='YOU NEED $2 TO PLAY'; beep(120,.2); return false; } INV.cash-=2; msg=''; beep(988,.08); setTimeout(()=>beep(1319,.15),80); return true; };
  const end=()=>{ mode='over'; wait=1.2; best=Math.max(best,g.score); const amt=1+G.grade.filter(v=>g.score>=v).length; if(skill)FORAGE.train(skill,400,0,amt); foot.textContent='SPACE TO PLAY AGAIN ($2) · ESC TO LEAVE'; };
  const close=()=>{ if(!C.on)return; C.on=false; C.tick=null; removeEventListener('keydown',kd,true); removeEventListener('keyup',ku,true); box.remove(); keys.clear(); };
  C.close=close; C.dbg=()=>({name,mode,score:g?g.score:0,over:g?g.over:false});
  C.tick=dt=>{ if(mode==='title'||mode==='over'){ wait=Math.max(0,wait-dt); if(T.F&&wait<=0&&coin()){ g=G.make(); mode='play'; foot.textContent='ESC TO LEAVE'; } }
    else if(mode==='play'){ g.step(dt,K,T); if(g.over)end(); }
    for(const k in T)delete T[k];
    if(g)g.draw(c); else { c.fillStyle='#05040a'; c.fillRect(0,0,W,H); }
    if(mode!=='play'){ c.fillStyle='rgba(0,0,0,.6)'; c.fillRect(20,62,216,104); c.strokeStyle='#ff3ca8'; c.strokeRect(20.5,62.5,215,103);
      if(mode==='title'){ tx(c,name,128,72,'#ffe83c',12,'center'); G.help.forEach((l,i)=>tx(c,l,128,94+i*12,'#e8f0ff',8,'center')); }
      else { tx(c,'GAME OVER',128,72,'#ff3c5a',14,'center'); tx(c,'SCORE '+g.score,128,96,'#fff',10,'center'); tx(c,'BEST '+best,128,110,'#a090c0',8,'center'); }
      tx(c,msg||(Math.floor(performance.now()/400)%2?'INSERT $2 · PRESS SPACE':''),128,146,msg?'#ff3c5a':'#5aff6a',8,'center'); } };
  keys.clear(); addEventListener('keydown',kd,true); addEventListener('keyup',ku,true); document.body.append(box); C.on=true; beep(660,.1); };
