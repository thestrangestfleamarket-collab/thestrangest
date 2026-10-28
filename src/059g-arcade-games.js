// THE ARCADE'S GAMES: the six cabinets' games (played in a cabinet window over the page, double-click a cabinet; a play costs $2 and trains the cabinet's skill by your score), their makers' stories, best scores, and the attract mode the cabinets' screens run.
import {FORAGE, INV, keys, SFX} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {STORE, SYS} from './006-map-pre.js';
STORE.cabs={tick:null,on:false,K:null};
SYS.add('places',dt=>{ if(STORE.cabs.tick)STORE.cabs.tick(dt); },'arcade games');
STORE.cabs.play=(name,skill)=>STORE.cabs.kit().open(name,skill);
STORE.cabs.kit=()=>{ '@arcade'; const C=STORE.cabs; if(C.K)return C.K;
  const W=256, H=224, R=Math.random, ri=n=>Math.floor(R()*n), cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  let MUTE=false;
  const tx=(c,s,x,y,col,sz=8,al='left')=>{ c.font=`bold ${sz}px monospace`; c.textAlign=al; c.textBaseline='top'; c.fillStyle='#000'; c.fillText(s,x+1,y+1); c.fillStyle=col; c.fillText(s,x,y); };
  const bmp=(c,rows,x,y,col,k=1)=>{ c.fillStyle=col; rows.forEach((r,j)=>{ for(let i=0;i<r.length;i++)if(r[i]==='#')c.fillRect(Math.round(x+i*k),Math.round(y+j*k),k,k); }); };
  const beep=(f,d=.08,ty='square',v=.06,f2)=>{ if(MUTE)return; const a=SFX.live&&SFX.live(); if(!a||!SFX.on)return; const o=a.createOscillator(), g=a.createGain(), t=a.currentTime; o.type=ty; o.frequency.setValueAtTime(f,t); if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v*(SFX.vol??1),t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+d+.02); };
  const DIRS={L:[-1,0],R:[1,0],U:[0,-1],D:[0,1]}, OPP={L:'R',R:'L',U:'D',D:'U'};
  const mv=(e,sp,ok,wrap)=>{ if(e.pick&&!e.d)e.pick(e); if(e.n&&e.d&&e.n===OPP[e.d]){ const v=DIRS[e.d]; e.x+=v[0]; e.y+=v[1]; if(wrap)e.x=(e.x+wrap)%wrap; e.t=1-e.t; e.d=e.n; }
    if(!e.d){ if(e.n&&ok(e.x+DIRS[e.n][0],e.y+DIRS[e.n][1]))e.d=e.n; else return; }
    e.t+=sp; while(e.t>=1){ const v=DIRS[e.d]; e.x+=v[0]; e.y+=v[1]; if(wrap)e.x=(e.x+wrap)%wrap; e.t-=1; if(e.pick)e.pick(e);
      if(e.n&&ok(e.x+DIRS[e.n][0],e.y+DIRS[e.n][1]))e.d=e.n; else if(!ok(e.x+DIRS[e.d][0],e.y+DIRS[e.d][1])){ e.t=0; e.d=null; return; } } };
  const at=e=>e.d?[e.x+DIRS[e.d][0]*e.t,e.y+DIRS[e.d][1]*e.t]:[e.x,e.y];
  const held=K=>K.L?'L':K.R?'R':K.U?'U':K.D?'D':null;
  const pops=(s,c)=>{ for(const p of s.pops){ c.globalAlpha=Math.min(1,p.t); tx(c,p.s,p.x,p.y-(1.2-p.t)*10,p.c||'#fff',8,'center'); } c.globalAlpha=1; }, popTick=(s,dt)=>{ for(const p of s.pops)p.t-=dt; s.pops=s.pops.filter(p=>p.t>0); };
  const LORE={
    'RAINBOW RUN':{maker:'KOSMO-ELEKTRON',place:'LENINGRAD',year:1984,col:'#ff3c5a',tag:'SEVEN COLOURS FALL OVER THE NEVA',story:['BUILT AFTER HOURS IN AN INSTITUTE','BASEMENT; SMUGGLED WEST IN RADIO CRATES.']},
    'GALAXY RAID':{maker:'TAIYO DENKI',place:'OSAKA',year:1979,col:'#ff3ca8',tag:'THEY CAME FOR THE COINS',story:['SO POPULAR IT EMPTIED THE HUNDRED-YEN','COINS OF A WHOLE WARD, OR SO THEY SAY.']},
    'MAZE':{maker:'MIDWEST AMUSEMENT CO.',place:'CHICAGO',year:1981,col:'#ffe83c',tag:'FOUR GHOSTS. ONE APPETITE.',story:['THE SERVICE MANUAL NAMES THE GHOSTS:','RUBY, PEARL, SKY AND AMBER.']},
    'ROAD 85':{maker:'SOLAR DRIVE',place:'TOKYO',year:1985,col:'#ff8a2a',tag:'THE SUN NEVER SETS ON ROUTE 85',story:['THE COAST ROAD FROM THE BOOTH TO THE SEA.','NOBODY HAS SEEN THE END OF IT.']},
    'TELEMAK':{maker:'TELEMAK ELECTRONICS',place:'SUNNYVALE',year:1973,col:'#3cf0ff',tag:'AVOID MISSING BALL FOR HIGH SCORE',story:['THE FIRST MACHINE IN THE MARKET. IT TOOK','QUARTERS LONG BEFORE IT TOOK DOLLARS.']},
    'ISTANBUL TAKSI':{maker:'BOĞAZİÇİ OYUN',place:'ISTANBUL',year:1986,col:'#ffd21c',tag:'EVERY FARE A STORY',story:['DRIVE THE OLD CITY FROM GALATA TO','AYASOFYA. MIND THE DOLMUŞ.']}};
  const BK='arcade-best', bests=()=>{ try{ return JSON.parse(OWNED.get(BK)||'{}')||{}; }catch(e){ return {}; } };
  const setBest=(n,v)=>{ const b=bests(); if(v<=(b[n]||0))return false; b[n]=v; OWNED.set(BK,JSON.stringify(b)); return true; };

  const blocks={ help:['← → MOVE  ↑ TURN  ↓ DROP','SPACE SLAM   C HOLD'], grade:[400,1500,4000], make:()=>{
    const P=[[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[1,1],[1,1]],[[0,1,0],[1,1,1],[0,0,0]],[[1,0,0],[1,1,1],[0,0,0]],[[0,0,1],[1,1,1],[0,0,0]],[[0,1,1],[1,1,0],[0,0,0]],[[1,1,0],[0,1,1],[0,0,0]]];
    const COL=['#3cf0ff','#ffe83c','#a46bff','#2a7bff','#ff8a2a','#5aff6a','#ff3c5a'];
    const B=Array.from({length:20},()=>Array(10).fill(0)), s={B,score:0,lines:0,lv:0,over:false,t:0,das:0,fl:0,bag:[],q:[],hold:-1,can:true,ld:0,lr:0,combo:-1,pops:[],rb:0};
    const next=()=>{ if(!s.bag.length){ s.bag=[0,1,2,3,4,5,6]; for(let i=6;i>0;i--){ const j=ri(i+1); [s.bag[i],s.bag[j]]=[s.bag[j],s.bag[i]]; } } return s.bag.pop(); };
    for(let i=0;i<3;i++)s.q.push(next());
    const rot=m=>m[0].map((_,i)=>m.map(r=>r[i]).reverse());
    const fits=(m,x,y)=>m.every((r,j)=>r.every((v,i)=>!v||(x+i>=0&&x+i<10&&y+j<20&&(y+j<0||!B[y+j][x+i]))));
    const spawn=k=>{ if(k==null){ k=s.q.shift(); s.q.push(next()); } s.p={m:P[k],k,x:k===1?4:3,y:k===0?-1:0}; s.ld=0; s.lr=0; s.t=0; if(!fits(s.p.m,s.p.x,s.p.y))s.over=true; };
    const lock=()=>{ const p=s.p; p.m.forEach((r,j)=>r.forEach((v,i)=>{ if(v){ if(p.y+j<0)s.over=true; else B[p.y+j][p.x+i]=p.k+1; } }));
      let n=0; for(let y=19;y>=0;y--)if(B[y].every(v=>v)){ B.splice(y,1); n++; } for(let i=0;i<n;i++)B.unshift(Array(10).fill(0));
      if(n){ s.combo++; s.score+=[0,100,300,500,800][n]*(s.lv+1)+(s.combo>0?50*s.combo*(s.lv+1):0); s.lines+=n; s.lv=Math.floor(s.lines/10); s.fl=.15;
        if(n===4){ s.rb=1.2; s.pops.push({s:'RAINBOW!',x:128,y:100,t:1.4,c:'#fff'}); } else if(s.combo>0)s.pops.push({s:'COMBO x'+(s.combo+1),x:128,y:100,t:1.2,c:'#ffe83c'});
        beep(520+n*120,.15,'square',.07,1040); } else { s.combo=-1; beep(140,.05,'triangle',.08); }
      s.can=true; if(!s.over)spawn(); };
    spawn();
    s.step=(dt,K,T)=>{ const p=s.p; s.fl=Math.max(0,s.fl-dt); s.rb=Math.max(0,s.rb-dt); popTick(s,dt);
      const gr=()=>!fits(p.m,p.x,p.y+1), moved=()=>{ if(gr()&&s.lr<15){ s.ld=0; s.lr++; } };
      if(T.H&&s.can){ const k=p.k; if(s.hold<0){ s.hold=k; spawn(); } else { const h=s.hold; s.hold=k; spawn(h); } s.can=false; beep(440,.05); return; }
      if(T.U){ const m=rot(p.m); for(const k of [0,-1,1,-2,2])if(fits(m,p.x+k,p.y)){ p.m=m; p.x+=k; moved(); beep(660,.03); break; } }
      const mx=d=>{ if(fits(p.m,p.x+d,p.y)){ p.x+=d; moved(); } };
      if(T.L){ mx(-1); s.das=.17; } else if(T.R){ mx(1); s.das=.17; } else if(K.L||K.R){ s.das-=dt; if(s.das<=0){ mx(K.L?-1:1); s.das=.05; } }
      if(T.F){ while(fits(p.m,p.x,p.y+1)){ p.y++; s.score+=2; } lock(); return; }
      const iv=K.D?.04:Math.max(.07,.8-s.lv*.07); s.t+=dt; while(s.t>=iv&&!gr()){ s.t-=iv; p.y++; s.ld=0; if(K.D)s.score++; }
      if(gr()){ s.t=Math.min(s.t,iv); s.ld+=dt; if(s.ld>=.5)lock(); } };
    const mini=(k,x,y,q)=>{ const m=P[k].filter(r=>r.some(v=>v)); m.forEach((r,j)=>r.forEach((v,i)=>{ if(v){ c_.fillStyle=COL[k]; c_.fillRect(x+i*q,y+j*q,q-1,q-1); } })); };
    let c_=null;
    s.draw=c=>{ c_=c; const ox=78, oy=12, Q=10, t=performance.now()/1000;
      c.fillStyle='#08050e'; c.fillRect(0,0,W,H); c.fillStyle='#120a1c'; for(let i=0;i<9;i++)c.fillRect(0,i*26+((t*8)%26),W,1);
      c.fillStyle=s.rb>0?`hsl(${t*600%360},90%,55%)`:'#3a2a50'; c.fillRect(ox-3,oy-3,Q*10+6,Q*20+6); c.fillStyle=s.fl>0?'#3a2a50':'#05040a'; c.fillRect(ox,oy,Q*10,Q*20);
      c.fillStyle='#120f1e'; for(let i=1;i<10;i++)c.fillRect(ox+i*Q,oy,1,Q*20); for(let j=1;j<20;j++)c.fillRect(ox,oy+j*Q,Q*10,1);
      const cell=(x,y,k,a)=>{ if(y<0)return; c.globalAlpha=a; c.fillStyle=COL[k]; c.fillRect(ox+x*Q,oy+y*Q,Q-1,Q-1); c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(ox+x*Q,oy+y*Q,Q-1,2); c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(ox+x*Q,oy+y*Q+Q-3,Q-1,2); c.globalAlpha=1; };
      B.forEach((r,y)=>r.forEach((v,x)=>v&&cell(x,y,v-1,1)));
      const p=s.p; if(p&&!s.over){ let gy=p.y; while(fits(p.m,p.x,gy+1))gy++; p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,gy+j,p.k,.22))); const lk=s.ld>0?.55+.45*Math.cos(s.ld*25):1; p.m.forEach((r,j)=>r.forEach((v,i)=>v&&cell(p.x+i,p.y+j,p.k,lk))); }
      tx(c,'SCORE',6,14,'#ff8a2a'); tx(c,String(s.score),6,24,'#fff'); tx(c,'LINES',6,42,'#ff8a2a'); tx(c,String(s.lines),6,52,'#fff'); tx(c,'LEVEL',6,70,'#ff8a2a'); tx(c,String(s.lv+1),6,80,'#fff');
      tx(c,'HOLD',6,108,s.can?'#ff8a2a':'#5a4a6a'); c.strokeStyle='#3a2a50'; c.strokeRect(6.5,120.5,40,24); if(s.hold>=0){ c.globalAlpha=s.can?1:.4; mini(s.hold,10,124,8); c.globalAlpha=1; }
      tx(c,'NEXT',190,14,'#ff8a2a'); s.q.forEach((k,i)=>mini(k,192,30+i*28,i?7:9)); pops(s,c); };
    return s; } };

  const raid={ help:['← → MOVE','SPACE FIRE'], grade:[500,1500,3000], make:()=>{
    const SQ=[['...##...','..####..','.######.','##.##.##','########','..#..#..','.#.##.#.','#.#..#.#'],['...##...','..####..','.######.','##.##.##','########','.#.##.#.','#......#','.#....#.']];
    const CR=[['..#.....#..','...#...#...','..#######..','.##.###.##.','###########','#.#######.#','#.#.....#.#','...##.##...'],['..#.....#..','#..#...#..#','#.#######.#','###.###.###','###########','.#########.','..#.....#..','.#.......#.']];
    const SHIP=['......#......','.....###.....','.###########.','#############','#############'], UFO=['.....######.....','...##########...','..############..','.##.##.##.##.##.','################','..###..##..###..','...#........#...'];
    const s={x:128,lives:3,score:0,wave:1,al:[],b:null,eb:[],dir:1,fx:0,fy:0,ft:1.5,dead:0,an:0,sh:[],over:false,mt:0,ufo:null,ut:16,pops:[],extra:1500,dv:6};
    const wave=()=>{ s.al=[]; for(let r=0;r<5;r++)for(let c=0;c<9;c++)s.al.push({hx:32+c*20,hy:30+r*14+Math.min(s.wave-1,4)*6,r,x:0,y:0,dive:0}); s.fx=0; s.fy=0; s.dir=1; s.eb=[]; s.b=null; s.ft=1.5; s.dv=6; for(const a of s.al){ a.x=a.hx; a.y=a.hy; } };
    for(const bx of [44,100,156,212])for(let j=0;j<4;j++)for(let i=0;i<6;i++)if(!(j===3&&(i===2||i===3)))s.sh.push({x:bx-12+i*4,y:172+j*4});
    const shHit=(x,y)=>{ const k=s.sh.findIndex(q=>x>=q.x-1&&x<q.x+5&&y>=q.y&&y<q.y+4); if(k<0)return false; s.sh.splice(k,1); return true; };
    const hitMe=()=>{ s.lives--; s.dead=1.2; s.eb=[]; beep(110,.5,'sawtooth',.08,40); };
    wave();
    s.step=(dt,K,T)=>{ s.an+=dt; popTick(s,dt);
      if(s.dead>0){ s.dead-=dt; if(s.dead<=0&&s.lives<=0)s.over=true; return; }
      if(K.L)s.x-=100*dt; if(K.R)s.x+=100*dt; s.x=cl(s.x,10,246);
      if((T.F||K.F)&&!s.b){ s.b={x:s.x,y:198}; beep(880,.07,'square',.04,440); }
      if(s.b){ s.b.y-=240*dt; if(s.b.y<10)s.b=null; else if(shHit(s.b.x,s.b.y))s.b=null;
        else if(s.ufo&&Math.abs(s.b.x-s.ufo.x)<9&&Math.abs(s.b.y-s.ufo.y)<5){ const v=[50,100,150,300][ri(4)]; s.score+=v; s.pops.push({s:String(v),x:s.ufo.x,y:s.ufo.y,t:1.2,c:'#ff3c5a'}); s.ufo=null; s.b=null; s.ut=18+R()*8; beep(1200,.4,'square',.06,200); }
        else for(let i=0;i<s.al.length;i++){ const a=s.al[i]; if(Math.abs(s.b.x-a.x)<7&&Math.abs(s.b.y-a.y)<5){ const v=[30,20,20,10,10][a.r]*(a.dive?2:1); s.score+=v; if(a.dive)s.pops.push({s:String(v),x:a.x,y:a.y,t:1,c:'#ffe83c'}); s.al.splice(i,1); s.b=null; beep(220,.12,'sawtooth',.06,60); break; } } }
      const n=s.al.length; if(!n){ s.wave++; wave(); s.pops.push({s:'WAVE '+s.wave,x:128,y:110,t:1.6,c:'#ff7ad8'}); return; }
      const fm=s.al.filter(a=>!a.dive), sp=10+(45-n)*1.6+s.wave*4;
      if(fm.length){ s.fx+=s.dir*sp*dt; let lo=1e9, hi=-1e9; for(const a of fm){ lo=Math.min(lo,a.hx); hi=Math.max(hi,a.hx); }
        if(hi+s.fx>244||lo+s.fx<12){ s.dir*=-1; s.fx=cl(s.fx,12-lo,244-hi); s.fy+=6; } for(const a of fm){ a.x=a.hx+s.fx; a.y=a.hy+s.fy; if(a.y>=190)s.lives=0; } if(s.lives<=0){ s.dead=.6; return; } }
      s.mt+=dt*sp/20; if(s.mt>1){ s.mt=0; beep(70+((s.an*4|0)%4)*10,.05,'square',.05); }
      for(const a of fm)shHit(a.x,a.y+3);
      if(s.wave>=2){ s.dv-=dt; if(s.dv<=0){ s.dv=Math.max(1.5,6-s.wave*.6)*(.7+R()*.6); const low=fm.filter(a=>!fm.some(q=>q!==a&&q.hx===a.hx&&q.hy>a.hy)); if(low.length){ const a=low[ri(low.length)]; a.dive=1; a.t=0; a.fired=false; beep(900,.4,'triangle',.04,300); } } }
      for(let i=s.al.length-1;i>=0;i--){ const a=s.al[i]; if(!a.dive)continue; a.t+=dt;
        if(a.dive===1){ a.y+=(60+s.wave*6)*dt; a.x=cl(a.x+(Math.sign(s.x-a.x)*35+Math.cos(a.t*4)*60)*dt,8,248); if(!a.fired&&a.y>100){ a.fired=true; s.eb.push({x:a.x,y:a.y+6}); }
          if(Math.abs(a.x-s.x)<9&&Math.abs(a.y-206)<7){ s.al.splice(i,1); hitMe(); return; } if(a.y>232){ a.dive=2; a.y=-10; a.x=a.hx+s.fx; } }
        else { const ty=a.hy+s.fy; a.y+=50*dt; a.x+=(a.hx+s.fx-a.x)*Math.min(1,dt*4); if(a.y>=ty){ a.dive=0; a.y=ty; } } }
      s.ft-=dt; if(s.ft<=0){ s.ft=Math.max(.3,1.1-s.wave*.1)*(.6+R()*.8); const a=s.al[ri(n)], low=s.al.filter(q=>Math.abs(q.x-a.x)<3).reduce((m,q)=>q.y>m.y?q:m,a); s.eb.push({x:low.x,y:low.y+6}); }
      for(let i=s.eb.length-1;i>=0;i--){ const e=s.eb[i]; e.y+=100*dt; if(e.y>224||shHit(e.x,e.y)){ s.eb.splice(i,1); continue; } if(Math.abs(e.x-s.x)<7&&e.y>200&&e.y<212){ s.eb.splice(i,1); hitMe(); break; } }
      s.ut-=dt; if(!s.ufo&&s.ut<=0){ const l=R()<.5; s.ufo={x:l?-10:266,y:18,v:l?55:-55}; } if(s.ufo){ s.ufo.x+=s.ufo.v*dt; if(Math.floor(s.an*8)%2)beep(s.an*10%2<1?600:800,.05,'sine',.02); if(s.ufo.x<-14||s.ufo.x>270){ s.ufo=null; s.ut=18+R()*8; } }
      if(s.score>=s.extra){ s.extra+=5000; if(s.lives<5){ s.lives++; s.pops.push({s:'EXTRA SHIP',x:128,y:120,t:1.6,c:'#5aff6a'}); beep(1320,.5,'square',.05,1760); } } };
    s.draw=c=>{ c.fillStyle='#04030a'; c.fillRect(0,0,W,H); for(let i=0;i<40;i++){ c.fillStyle=i%3?'#2a2440':'#5a5080'; c.fillRect((i*73)%W,(i*131+s.an*6)%H,1,1); }
      c.fillStyle='#1a1428'; c.beginPath(); c.arc(206,200,60,Math.PI,0); c.fill();
      const fr=Math.floor(s.an*2)%2, COLS=['#ff4fd8','#4ff0ff','#4ff0ff','#5aff6a','#5aff6a'];
      for(const a of s.al){ const sp=a.r===0?SQ[fr]:CR[fr]; bmp(c,sp,a.x-sp[0].length/2,a.y-4,a.dive?'#ffe83c':COLS[a.r]); }
      if(s.ufo)bmp(c,UFO,s.ufo.x-8,s.ufo.y-3,'#ff3c5a');
      c.fillStyle='#5aff6a'; for(const q of s.sh)c.fillRect(q.x,q.y,4,4);
      if(s.dead<=0||Math.floor(s.dead*10)%2)bmp(c,SHIP,s.x-6,202,'#ffe83c');
      c.fillStyle='#fff'; if(s.b)c.fillRect(s.b.x,s.b.y,1,5); c.fillStyle='#ff8a2a'; for(const e of s.eb){ c.fillRect(e.x-1+((e.y/4|0)%2),e.y,2,5); }
      c.fillStyle='#5aff6a'; c.fillRect(0,214,W,1); tx(c,'SCORE '+s.score,6,2,'#fff'); tx(c,'WAVE '+s.wave,128,2,'#ff7ad8',8,'center');
      for(let i=0;i<s.lives;i++)bmp(c,SHIP,190+i*12,216,'#ffe83c',.6); pops(s,c); };
    return s; } };

  const MAZES=[['###################','#........#........#','#o##.###.#.###.##o#','#.................#','#.##.#.#####.#.##.#','#....#...#...#....#','####.### # ###.####','   #.#       #.#   ','####.# ##-## #.####','    .  #   #  .    ','####.# ##### #.####','   #.#       #.#   ','####.# ##### #.####','#........#........#','#.##.###.#.###.##.#','#o.#.....P.....#.o#','##.#.#.#####.#.#.##','#....#...#...#....#','#.######.#.######.#','#.................#','###################'],
    ['###################','#.......#.#.......#','#o###.#.#.#.#.###o#','#.................#','##.#.###.#.###.#.##','#..#...#...#...#..#','####.### # ###.####','   #.#       #.#   ','####.# ##-## #.####','    .  #   #  .    ','####.# ##### #.####','   #.#       #.#   ','####.# ##### #.####','#..#.....#.....#..#','#.##.##.###.##.##.#','#o.......P.......o#','###.#.##.#.##.#.###','#.....#.....#.....#','#.###.#.###.#.###.#','#.................#','###################']];
  const FRUIT=[['CHERRY',100,'#ff3c5a'],['STRAWBERRY',300,'#ff5a7a'],['ORANGE',500,'#ff8a2a'],['APPLE',700,'#ff2a2a'],['MELON',1000,'#5aff6a'],['SIMIT',2000,'#d89a50']];
  const maze={ help:['ARROWS MOVE','EAT EVERY DOT'], grade:[1000,3000,6000], make:()=>{
    const MW=19, MH=21, s={score:0,lives:3,lv:0,over:false,pw:0,chain:0,t:0,wait:1.5,dead:0,mi:0,mt:0,de:0,fr:null,got:[],clr:0,pops:[]};
    const SCH=[7,20,7,20,5,1e9], CORN=[[18,-3],[0,-3],[18,23],[0,23]];
    let M=MAZES[0]; const wall=(x,y)=>{ x=((x%MW)+MW)%MW; return y<0||y>=MH||'#-'.includes(M[y][x]); }, ok=(x,y)=>!wall(x,y);
    let dots=new Map(); const fill=()=>{ M=MAZES[s.lv%2]; dots=new Map(); s.de=0; M.forEach((r,y)=>[...r].forEach((ch,x)=>{ if(ch==='.'||ch==='o')dots.set(x+','+y,ch); })); };
    const GC=['#ff3c5a','#ffb8ff','#3cf0ff','#ffb852'], pac={}, gh=GC.map((col,i)=>({col,i}));
    const pick=g=>{ const opts=['U','L','D','R'].filter(d=>d!==OPP[g.d]&&ok(g.x+DIRS[d][0],g.y+DIRS[d][1]));
      if(!opts.length){ g.n=g.d?OPP[g.d]:null; return; } if(s.pw>0){ g.n=opts[ri(opts.length)]; return; }
      const [px,py]=at(pac), v=pac.d?DIRS[pac.d]:[0,0]; let T_;
      if(s.mi%2===0)T_=CORN[g.i]; else if(g.i===0)T_=[px,py]; else if(g.i===1)T_=[px+v[0]*4,py+v[1]*4];
      else if(g.i===2){ const r=at(gh[0]), a=[px+v[0]*2,py+v[1]*2]; T_=[2*a[0]-r[0],2*a[1]-r[1]]; } else T_=Math.hypot(px-g.x,py-g.y)>8?[px,py]:CORN[3];
      g.n=opts.reduce((b,d)=>{ const q=Math.hypot(g.x+DIRS[d][0]-T_[0],g.y+DIRS[d][1]-T_[1]); return q<b[0]?[q,d]:b; },[1e9,opts[0]])[1]; };
    const rev=()=>{ for(const g of gh)if(g.d&&g.pen<=0)g.n=OPP[g.d]; };
    const reset=()=>{ Object.assign(pac,{x:9,y:15,t:0,d:null,n:null}); gh.forEach((g,i)=>Object.assign(g,{x:9,y:7,t:0,d:null,n:null,pen:i*2.5,pick})); s.pw=0; s.wait=1.2; s.mi=0; s.mt=0; s.fr=null; };
    fill(); reset();
    s.step=(dt,K,T)=>{ s.t+=dt; popTick(s,dt);
      if(s.clr>0){ s.clr-=dt; if(s.clr<=0){ s.lv++; fill(); reset(); } return; }
      if(s.dead>0){ s.dead-=dt; if(s.dead<=0){ if(s.lives<=0)s.over=true; else reset(); } return; }
      if(s.wait>0){ s.wait-=dt; return; } const h=held(K); if(h)pac.n=h; const sp=1+Math.min(s.lv,6)*.05;
      if(s.pw<=0){ s.mt+=dt; if(s.mt>=SCH[Math.min(s.mi,5)]){ s.mt=0; s.mi++; rev(); } }
      mv(pac,6.5*sp*dt,ok,MW); const k=pac.x+','+pac.y, d_=dots.get(k);
      if(d_&&pac.t<.5){ dots.delete(k); s.de++; if(d_==='o'){ s.score+=50; s.pw=Math.max(1.5,6-s.lv*.8); s.chain=0; rev(); beep(300,.25,'square',.06,900); } else { s.score+=10; beep(s.de%2?500:420,.03,'square',.03); }
        if(s.de===70||s.de===170)s.fr={t:9,k:Math.min(s.lv,5)}; }
      if(s.fr){ s.fr.t-=dt; if(s.fr.t<=0)s.fr=null; else if(pac.x===9&&pac.y===11&&pac.t<.5){ const f=FRUIT[s.fr.k]; s.score+=f[1]; s.got.push(s.fr.k); s.pops.push({s:String(f[1]),x:33+95,y:12+111,t:1.4,c:f[2]}); s.fr=null; beep(1000,.3,'square',.06,1600); } }
      if(!dots.size){ s.score+=500; s.clr=1.6; beep(700,.6,'square',.05,1400); return; }
      s.pw=Math.max(0,s.pw-dt); const [px,py]=at(pac);
      for(const g of gh){ if(g.pen>0){ g.pen-=dt; continue; } mv(g,(s.pw>0?3.6:(5.8+Math.min(s.lv,6)*.25))*dt,ok,MW); const [gx,gy]=at(g);
        if(Math.hypot(gx-px,gy-py)<.7){ if(s.pw>0){ s.chain++; const v=200*2**(s.chain-1); s.score+=v; s.pops.push({s:String(v),x:33+gx*10+5,y:12+gy*10,t:1,c:'#3cf0ff'}); Object.assign(g,{x:9,y:7,t:0,d:null,n:null,pen:3}); beep(900,.2,'square',.06,200); }
          else { s.lives--; s.dead=1.5; beep(500,1,'sawtooth',.07,60); return; } } } };
    const fruit=(c,k,x,y)=>{ const f=FRUIT[k]; c.fillStyle=f[2]; if(k===5){ c.strokeStyle=f[2]; c.lineWidth=2; c.beginPath(); c.arc(x,y,3.5,0,7); c.stroke(); c.lineWidth=1; return; }
      if(k===0){ c.beginPath(); c.arc(x-2,y+1.5,2.2,0,7); c.arc(x+2,y+1.5,2.2,0,7); c.fill(); c.fillStyle='#5aff6a'; c.fillRect(x-1,y-4,2,3); return; }
      c.beginPath(); c.arc(x,y,k===4?4.5:3.8,0,7); c.fill(); c.fillStyle='#5aff6a'; c.fillRect(x,y-5,2,2); if(k===1){ c.fillStyle='#fff'; c.fillRect(x-1,y-1,1,1); c.fillRect(x+1,y+1,1,1); } };
    s.draw=c=>{ const Q=10, ox=33, oy=12, fl=s.clr>0&&Math.floor(s.clr*6)%2; c.fillStyle='#000'; c.fillRect(0,0,W,H);
      M.forEach((r,y)=>[...r].forEach((ch,x)=>{ if(ch==='#'){ c.fillStyle=fl?'#6a6a8a':'#14206a'; c.fillRect(ox+x*Q,oy+y*Q,Q,Q); c.fillStyle=fl?'#fff':(s.lv%2?'#ff5ab8':'#2a7bff');
          if(!wall(x,y-1))c.fillRect(ox+x*Q,oy+y*Q,Q,2); if(!wall(x,y+1))c.fillRect(ox+x*Q,oy+y*Q+Q-2,Q,2); if(!wall(x-1,y))c.fillRect(ox+x*Q,oy+y*Q,2,Q); if(!wall(x+1,y))c.fillRect(ox+x*Q+Q-2,oy+y*Q,2,Q); }
        else if(ch==='-'){ c.fillStyle='#ffb8ff'; c.fillRect(ox+x*Q,oy+y*Q+4,Q,2); } }));
      for(const [k,ch] of dots){ const i=k.indexOf(','), x=+k.slice(0,i), y=+k.slice(i+1); c.fillStyle='#ffd8b0'; if(ch==='o'){ if(Math.floor(s.t*4)%2){ c.beginPath(); c.arc(ox+x*Q+5,oy+y*Q+5,3.5,0,7); c.fill(); } } else c.fillRect(ox+x*Q+4,oy+y*Q+4,2,2); }
      if(s.fr)fruit(c,s.fr.k,ox+9*Q+5,oy+11*Q+5);
      const [px,py]=at(pac), mo=s.dead>0?Math.PI*(1-s.dead/1.5):(.1+.25*Math.abs(Math.sin(s.t*12)))*Math.PI, an={R:0,D:Math.PI/2,L:Math.PI,U:-Math.PI/2}[pac.d||pac.n||'L'];
      c.fillStyle='#ffe83c'; c.beginPath(); c.moveTo(ox+px*Q+5,oy+py*Q+5); c.arc(ox+px*Q+5,oy+py*Q+5,4.6,an+mo,an+2*Math.PI-mo); c.fill();
      if(s.dead<=0&&s.clr<=0)for(const g of gh){ const [gx,gy]=g.pen>0?[8+g.i%3,9]:at(g), X_=ox+gx*Q+5, Y_=oy+gy*Q+5, fr=s.pw>0&&!(s.pw<2&&Math.floor(s.t*6)%2);
        c.fillStyle=fr?'#2a3cff':g.col; c.beginPath(); c.arc(X_,Y_-1,4.6,Math.PI,0); c.lineTo(X_+4.6,Y_+4.5); for(let i=0;i<4;i++)c.lineTo(X_+4.6-(i+.5)*2.3,Y_+(i%2?4.5:2.5)); c.lineTo(X_-4.6,Y_+4.5); c.fill();
        c.fillStyle='#fff'; c.fillRect(X_-3,Y_-3,2,3); c.fillRect(X_+1,Y_-3,2,3); if(!fr&&g.d){ const v=DIRS[g.d]; c.fillStyle='#2a3cff'; c.fillRect(X_-3+v[0]+.5,Y_-2+v[1],1,1); c.fillRect(X_+1+v[0]+.5,Y_-2+v[1],1,1); } }
      tx(c,'SCORE',229,14,'#ffe83c',7); tx(c,String(s.score),229,24,'#fff',7); tx(c,'LIVES',229,44,'#ffe83c',7); tx(c,String(Math.max(0,s.lives)),229,54,'#fff',7); tx(c,'LEVEL',229,74,'#ffe83c',7); tx(c,String(s.lv+1),229,84,'#fff',7);
      s.got.slice(-6).forEach((k,i)=>fruit(c,k,238,120+i*14)); if(s.wait>0&&s.dead<=0)tx(c,'READY!',ox+95,oy+9*Q+1,'#ffe83c',8,'center'); pops(s,c); };
    return s; } };

  const road={ help:['↑ / SPACE GAS   ↓ BRAKE','← → STEER'], grade:[1500,4000,8000], make:()=>{
    const N=600, SL=200, RW=2000, CH=1000, DD=.84, VIS=150, MAX=SL*60, PZ=CH*DD, L=N*SL, STG=L*1.5, segs=[];
    while(segs.length<N){ const n=40+ri(60), c=R()<.35?0:(R()*2-1)*4; for(let i=0;i<n;i++)segs.push({c:c*Math.sin(Math.PI*i/n)}); } segs.length=N;
    segs.forEach((g,i)=>{ g.i=i; g.k=Math.floor(i/3)%2; g.y=1300*Math.sin(i/N*Math.PI*6)+600*Math.sin(i/N*Math.PI*14+1); g.spr=[]; });
    for(let i=10;i<N;i+=5+ri(5)){ const sd=R()<.5?-1:1, r=R(); segs[i].spr.push({t:r<.6?0:r<.8?1:2,x:sd*(1.35+R()*.7),v:ri(3)}); }
    const CC=['#3cf0ff','#ffe83c','#5aff6a','#ff8a2a','#a46bff','#ffffff'], cars=[], addCars=n=>{ for(let i=0;i<n&&cars.length<30;i++)cars.push({z:3000+R()*(L-6000),x:R()*1.5-.75,sp:MAX*(.25+R()*.3),col:CC[ri(6)]}); }; addCars(10);
    let K_={}; const s={cars,pz:0,x:0,sp:0,time:35,dist:0,score:0,bg:0,stage:1,next:STG,msg:0,bonus:0,over:false,bump:0};
    const yAt=z=>{ const i=Math.floor(z/SL), f=(z%SL)/SL; return segs[i%N].y+(segs[(i+1)%N].y-segs[i%N].y)*f; };
    s.step=(dt,K,T)=>{ K_=K; const pi=Math.floor((s.pz+PZ)/SL)%N, seg=segs[pi], pc=s.sp/MAX, dx=dt*2*pc;
      if(K.L)s.x-=dx; if(K.R)s.x+=dx; s.x-=dx*pc*seg.c*.2;
      if(s.time>0&&(K.U||K.F))s.sp+=MAX/4*dt; else if(K.D)s.sp-=MAX*dt; else s.sp-=MAX/5*dt;
      if(Math.abs(s.x)>1&&s.sp>MAX/4)s.sp-=MAX/1.2*dt; s.x=cl(s.x,-2.4,2.4); s.sp=cl(s.sp,0,MAX);
      for(const c of cars)c.z=(c.z+c.sp*dt)%L; s.bump=Math.max(0,s.bump-dt);
      if(Math.abs(s.x)>1)for(const q of seg.spr)if(Math.abs(s.x-q.x)<.32&&s.sp>MAX/8){ s.sp=MAX/8; s.bump=.6; s.x*=.9; beep(70,.4,'sawtooth',.09,30); }
      for(const c of cars){ const dz=((c.z-(s.pz+PZ))%L+L)%L; if(dz<SL&&Math.abs(c.x-s.x)<.3&&s.sp>c.sp){ s.sp=c.sp*.5; s.pz=((s.pz-(SL-dz))%L+L)%L; s.bump=.4; beep(90,.25,'sawtooth',.08,40); } }
      s.pz=(s.pz+s.sp*dt)%L; s.dist+=s.sp*dt; s.score=Math.floor(s.dist/100); s.bg+=seg.c*pc*dt*14;
      if(s.dist>=s.next&&s.time>0){ s.stage++; s.next+=STG; s.bonus=Math.max(6,18-s.stage*2); s.time+=s.bonus; s.msg=2.5; addCars(3); beep(660,.4,'square',.06,1320); }
      s.time=Math.max(0,s.time-dt); s.msg=Math.max(0,s.msg-dt); if(s.time<=0&&s.sp<=0)s.over=true;
      if(s.sp>0&&R()<dt*8)beep(60+pc*140,.06,'sawtooth',.012); };
    const sprite=(c,q,X_,Y_,u)=>{ if(q.t===0){ const h=.9*u, tw=Math.max(1,.05*u); c.fillStyle='#2a1030'; c.beginPath(); c.moveTo(X_-tw,Y_); c.quadraticCurveTo(X_+.08*u,Y_-h*.5,X_+.06*u,Y_-h); c.lineTo(X_+.06*u+tw,Y_-h); c.quadraticCurveTo(X_+.08*u+tw,Y_-h*.5,X_+tw,Y_); c.fill();
        c.strokeStyle='#14081e'; c.lineWidth=Math.max(1,.04*u); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, ex=X_+.06*u+Math.cos(a)*.32*u, ey=Y_-h+Math.abs(Math.sin(a))*.1*u+.06*u; c.beginPath(); c.moveTo(X_+.06*u,Y_-h); c.quadraticCurveTo((X_+.06*u+ex)/2,Y_-h-.12*u,ex,ey); c.stroke(); } c.lineWidth=1; }
      else if(q.t===1){ const w=.6*u, h=.25*u, by=Y_-.38*u; c.fillStyle='#14081e'; c.fillRect(X_-w*.35,by,.03*u+1,.38*u); c.fillRect(X_+w*.32,by,.03*u+1,.38*u); c.fillStyle='#0a0614'; c.fillRect(X_-w/2,by-h,w,h);
        const col=['#ff3ca8','#3cf0ff','#ffe83c'][q.v]; c.strokeStyle=col; c.lineWidth=Math.max(1,.015*u); c.strokeRect(X_-w/2+2,by-h+2,w-4,h-4); c.lineWidth=1; if(w>28)tx(c,['ROAD 85','SOLAR','DRIVE-IN'][q.v],X_,by-h/2-h*.22,col,Math.max(6,Math.min(14,h*.45)),'center'); }
      else { const h=.75*u; c.fillStyle='#14081e'; c.fillRect(X_-.015*u,Y_-h,.03*u+1,h); c.fillRect(X_-(q.x>0?.18:0)*u,Y_-h,.18*u,.025*u+1); const lx=X_+(q.x>0?-.18:.18)*u;
        c.fillStyle='rgba(255,220,140,.25)'; c.beginPath(); c.arc(lx,Y_-h,.12*u,0,7); c.fill(); c.fillStyle='#ffe8b0'; c.fillRect(lx-.03*u,Y_-h,.06*u+1,.03*u+1); } };
    s.draw=c=>{ const g=c.createLinearGradient(0,0,0,H/2); g.addColorStop(0,'#1a0838'); g.addColorStop(.7,'#7a1a78'); g.addColorStop(1,'#ff3ca8'); c.fillStyle=g; c.fillRect(0,0,W,H/2+1);
      const sx=((128-s.bg*.3)%W+W)%W; c.fillStyle='#ffd23c'; c.beginPath(); c.arc(sx,H/2-4,30,Math.PI,0); c.fill(); c.fillStyle='#ff8a2a'; c.beginPath(); c.arc(sx,H/2-4,30,Math.PI,Math.PI*1.5,true); c.fill();
      c.fillStyle='#7a1a78'; for(let i=0;i<5;i++)c.fillRect(sx-31,H/2-6-i*5,62,1+i*.4);
      for(const [sp,col,hh] of [[.6,'#3a0c50',22],[1,'#22062e',14]]){ c.fillStyle=col; c.beginPath(); c.moveTo(0,H/2); for(let x=0;x<=W;x+=4){ const q=x+s.bg*sp+hh*40; c.lineTo(x,H/2-hh*(.55+.3*Math.sin(q*.031)+.15*Math.sin(q*.083))); } c.lineTo(W,H/2); c.fill(); }
      c.fillStyle='#120626'; c.fillRect(0,H/2,W,H/2);
      const base=Math.floor(s.pz/SL), bp=(s.pz%SL)/SL, camX=s.x*RW, camY=yAt(s.pz+PZ)+CH; let x=0, dx=-(segs[base%N].c*bp), maxy=H;
      const P=(z,xx,yy)=>{ const sc=DD/z; return [W/2+sc*(xx-camX)*W/2,H/2-sc*(yy-camY)*H/2,sc*RW*W/2]; }, quad=(col,x1,y1,w1,x2,y2,w2)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(x1-w1,y1); c.lineTo(x2-w2,y2); c.lineTo(x2+w2,y2); c.lineTo(x1+w1,y1); c.fill(); };
      const vis=[];
      for(let n=0;n<VIS;n++){ const sg=segs[(base+n)%N], nx=segs[(base+n+1)%N], z0=n*SL-bp*SL, z1=z0+SL, a=P(z0,x,sg.y), b=P(z1,x+dx,nx.y); x+=dx; dx+=sg.c;
        if(z0<=DD||b[1]>=maxy)continue; sg.sx=a[0]; sg.sy=a[1]; sg.sc=DD/z0; sg.clip=maxy; vis.push(sg);
        c.fillStyle=sg.k?'#2a0a3a':'#1a0628'; c.fillRect(0,b[1],W,a[1]-b[1]+1);
        quad(sg.k?'#ff3ca8':'#ffffff',a[0],a[1],a[2]*1.12,b[0],b[1],b[2]*1.12); quad(sg.k?'#2a2838':'#302e40',a[0],a[1],a[2],b[0],b[1],b[2]);
        if(sg.k)for(const l of [-1/3,1/3])quad('#e8e0ff',a[0]+a[2]*l,a[1],a[2]*.02,b[0]+b[2]*l,b[1],b[2]*.02); maxy=b[1]; }
      const by=new Map(); for(const car of cars){ const i=Math.floor(car.z/SL); if(!by.has(i))by.set(i,[]); by.get(i).push(car); }
      for(let k=vis.length-1;k>=0;k--){ const sg=vis[k], u=sg.sc*RW*W/2; c.save(); c.beginPath(); c.rect(0,0,W,sg.clip); c.clip();
        for(const q of sg.spr)if(u>2)sprite(c,q,sg.sx+u*q.x,sg.sy,u);
        for(const car of by.get(sg.i)||[]){ const w=u*.28, h=w*.55, X_=sg.sx+u*car.x; if(w<1.5)continue;
          c.fillStyle=car.col; c.fillRect(X_-w/2,sg.sy-h,w,h*.7); c.fillStyle='#14101e'; c.fillRect(X_-w*.35,sg.sy-h*1.25,w*.7,h*.6); c.fillStyle='#ff2a2a'; c.fillRect(X_-w/2,sg.sy-h*.55,w*.18,h*.15); c.fillRect(X_+w*.32,sg.sy-h*.55,w*.18,h*.15); c.fillStyle='#000'; c.fillRect(X_-w*.45,sg.sy-h*.3,w*.2,h*.3); c.fillRect(X_+w*.25,sg.sy-h*.3,w*.2,h*.3); }
        c.restore(); }
      const cx=W/2+(s.bump>0?(R()-.5)*4:0)+(K_.L?-2:K_.R?2:0), cy=H-4;
      c.fillStyle='#000'; c.fillRect(cx-30,cy-10,12,10); c.fillRect(cx+18,cy-10,12,10); c.fillStyle='#ff3c5a'; c.fillRect(cx-32,cy-22,64,14); c.fillStyle='#c01a3a'; c.fillRect(cx-26,cy-32,52,11);
      c.fillStyle='#1a1430'; c.fillRect(cx-22,cy-31,44,8); c.fillStyle=K_.D?'#ff2a2a':'#ffe83c'; c.fillRect(cx-30,cy-19,10,4); c.fillRect(cx+20,cy-19,10,4); c.fillStyle='#fff'; c.fillRect(cx-6,cy-17,12,4);
      tx(c,'SCORE '+s.score,6,4,'#fff'); tx(c,'STAGE '+s.stage,6,14,'#ff7ad8'); tx(c,'TIME',128,2,'#ffe83c',8,'center'); tx(c,String(Math.ceil(s.time)),128,11,s.time<10&&Math.floor(s.time*4)%2?'#ff3c5a':'#ffe83c',14,'center');
      tx(c,Math.round(s.sp/MAX*285)+' KM/H',250,4,'#3cf0ff',8,'right'); if(s.msg>0)tx(c,'CHECKPOINT  +'+s.bonus,128,60,'#5aff6a',10,'center');
      if(s.time<=0)tx(c,'TIME UP',128,80,'#ff3c5a',16,'center'); };
    return s; } };

  const pong={ help:['↑ ↓ MOVE','FIRST TO 7'], grade:[400,900,1800], make:()=>{
    const s={y:112,py:112,cy:112,b:{x:128,y:112,vx:-120,vy:40},me:0,cpu:0,score:0,over:false,serve:1,win:false,rally:0,top:0,err:0,tr:[],pops:[]};
    const serve=d=>{ Object.assign(s.b,{x:128,y:60+R()*104,vx:d*125,vy:(R()*2-1)*70}); s.serve=1; s.rally=0; s.tr=[]; };
    s.step=(dt,K,T)=>{ popTick(s,dt); if(K.U)s.y-=160*dt; if(K.D)s.y+=160*dt; s.y=cl(s.y,22,202); const pv=dt>0?(s.y-s.py)/dt:0; s.py=s.y;
      const b=s.b; if(s.serve>0){ s.serve-=dt; return; }
      const csp=cl(110+10*(s.me-s.cpu)+s.rally*2,90,180), tgt=b.vx>0&&b.x>80?b.y+s.err:112; s.cy+=cl(tgt-s.cy,-csp*dt,csp*dt); s.cy=cl(s.cy,22,202);
      const ox=b.x, oy=b.y; b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y<10){ b.y=20-b.y; b.vy*=-1; beep(300,.03); } if(b.y>210){ b.y=420-b.y; b.vy*=-1; beep(300,.03); }
      const hit=(px,py,dir,mine)=>{ if(!(dir>0?ox>=px&&b.x<px:ox<=px&&b.x>px))return; const f=(ox-px)/(ox-b.x), yy=oy+(b.y-oy)*f; if(Math.abs(yy-py)>17)return;
        const sp=Math.min(340,Math.hypot(b.vx,b.vy)*1.06), a=(yy-py)/17*1.0; b.vx=dir*sp*Math.cos(a); b.vy=sp*Math.sin(a)+(mine?cl(pv*.3,-90,90):0); b.x=px; b.y=yy;
        if(mine){ s.rally++; const v=10*s.rally; s.score+=v; s.top=Math.max(s.top,s.rally); if(s.rally>2)s.pops.push({s:'+'+v,x:40,y:yy,t:.8,c:'#ffe83c'}); s.err=(R()*2-1)*Math.max(3,18-s.me*2); } beep(dir>0?480:360,.04); };
      hit(14,s.y,1,true); hit(242,s.cy,-1,false); s.tr.push([b.x,b.y]); if(s.tr.length>6)s.tr.shift();
      if(b.x<-4){ s.cpu++; beep(150,.3,'square',.06,80); if(s.cpu>=7)s.over=true; else serve(1); }
      if(b.x>W+4){ s.me++; s.score+=100; beep(800,.2,'square',.06,1200); if(s.me>=7){ s.win=true; s.score+=1000; s.over=true; } else serve(-1); } };
    s.draw=c=>{ c.fillStyle='#05060c'; c.fillRect(0,0,W,H); c.fillStyle='#2a7bff'; c.fillRect(0,0,W,4); c.fillRect(0,220,W,4); c.fillStyle='#e8f0ff'; for(let y=8;y<H;y+=12)c.fillRect(127,y,2,6);
      tx(c,String(s.me),96,12,'#e8f0ff',24,'center'); tx(c,String(s.cpu),160,12,'#e8f0ff',24,'center'); tx(c,'RALLY '+s.rally,96,200,'#7a8aa0',8,'center'); tx(c,'BEST '+s.top,160,200,'#7a8aa0',8,'center');
      c.fillStyle='#e8f0ff'; c.fillRect(10,s.y-14,4,28); c.fillRect(242,s.cy-14,4,28);
      s.tr.forEach(([x,y],i)=>{ c.globalAlpha=(i+1)/14; c.fillRect(x-2,y-2,4,4); }); c.globalAlpha=1;
      if(s.serve<=0||Math.floor(s.serve*8)%2)c.fillRect(s.b.x-2,s.b.y-2,4,4); if(s.win)tx(c,'YOU WIN',128,100,'#5aff6a',16,'center'); pops(s,c); };
    return s; } };

  const taksi={ help:['ARROWS DRIVE','PICK UP, DROP OFF, BE QUICK'], grade:[40,120,240], make:()=>{
    const GW=16, GH=13, Q=16, OY=16, road=(x,y)=>x>=0&&y>=0&&x<GW&&y<GH&&(x%3===0||y%3===0);
    const LM=[{n:'GALATA KULESİ',b:[1,0],k:0},{n:'AYASOFYA',b:[3,2],k:1},{n:'KAPALIÇARŞI',b:[2,1],k:2},{n:'TAKSİM',b:[4,0],k:3},{n:'KADIKÖY İSKELESİ',b:[0,3],k:4}];
    const s={score:0,time:60,over:false,cool:0,msg:'',mt:0,t:0,n:0,ride:null,lm:null,pops:[]}, taxi={x:6,y:6,t:0,d:null,n:'R'}; s.taxi=taxi;
    const spot=(fx,fy,m)=>{ for(let k=0;k<200;k++){ const x=ri(GW), y=ri(GH); if(road(x,y)&&Math.abs(x-fx)+Math.abs(y-fy)>=m)return [x,y]; } return [0,0]; };
    const near=(l,fx,fy)=>{ const [bx,by]=l.b, x0=3*bx, y0=3*by, o=[]; for(let i=0;i<=3;i++){ o.push([x0+i,y0],[x0+i,y0+3],[x0,y0+i],[x0+3,y0+i]); } const f=o.filter(p=>road(p[0],p[1])&&Math.abs(p[0]-fx)+Math.abs(p[1]-fy)>=6); const q=f.length?f:o.filter(p=>road(p[0],p[1])); return q[ri(q.length)]; };
    s.pas=spot(6,6,6); s.dst=null;
    const CC=['#e8e8f0','#3c6aff','#ff3c5a','#5aff6a','#a46bff','#ff8a2a'], cars=[];
    const addCar=()=>{ const [x,y]=spot(Math.round(taxi.x),Math.round(taxi.y),6), mini=cars.length%3===2; const c={x,y,t:0,d:null,n:null,col:mini?'#ffd21c':CC[ri(CC.length)],mini};
      c.pick=e=>{ const o=['U','L','D','R'].filter(d=>d!==OPP[e.d]&&road(e.x+DIRS[d][0],e.y+DIRS[d][1])); e.n=o.length?o[ri(o.length)]:OPP[e.d]; }; cars.push(c); };
    for(let i=0;i<4;i++)addCar();
    s.step=(dt,K,T)=>{ s.t+=dt; popTick(s,dt); const h=held(K); if(h)taxi.n=h; s.cool=Math.max(0,s.cool-dt); s.mt=Math.max(0,s.mt-dt); if(s.ride)s.ride.t+=dt;
      while(cars.length<Math.min(14,4+Math.floor(s.n/2)))addCar();
      mv(taxi,5*dt,road); for(const c of cars)mv(c,(c.mini?2.4:3)*dt,road); const [tx_,ty_]=at(taxi);
      for(const c of cars){ const [cx,cy]=at(c); if(s.cool<=0&&Math.hypot(cx-tx_,cy-ty_)<(c.mini?.85:.75)){ s.cool=1; s.time=Math.max(0,s.time-3); if(taxi.d)taxi.n=OPP[taxi.d]; s.msg=c.mini?'DOLMUŞ! -3s':'CRASH! -3s'; s.mt=1; beep(120,.3,'sawtooth',.08,50); } }
      if(!s.dst&&Math.hypot(s.pas[0]-tx_,s.pas[1]-ty_)<.5){ { const o=LM.filter(l=>l!==s.lm); s.lm=o[ri(o.length)]; } s.dst=near(s.lm,s.pas[0],s.pas[1]); const d=Math.abs(s.dst[0]-s.pas[0])+Math.abs(s.dst[1]-s.pas[1]);
        s.ride={t:0,d,est:d/5*1.5+2}; s.msg='TO '+s.lm.n+'!'; s.mt=1.8; beep(700,.12,'square',.05,1100); }
      else if(s.dst&&Math.hypot(s.dst[0]-tx_,s.dst[1]-ty_)<.5){ const base=5+s.ride.d, tip=Math.max(0,Math.round((s.ride.est-s.ride.t)*2)), bt=Math.max(4,10-s.n*.5); s.score+=base+tip; s.time+=bt; s.n++;
        s.pops.push({s:'$'+base+(tip?' +$'+tip+' TIP':''),x:128,y:96,t:1.6,c:tip?'#5aff6a':'#fff'}); s.msg='+'+Math.round(bt)+'s'; s.mt=1.2; s.pas=spot(s.dst[0],s.dst[1],6); s.dst=null; s.ride=null; beep(900,.3,'square',.06,1800); }
      s.time=Math.max(0,s.time-dt); if(s.time<=0)s.over=true; };
    const BC=['#c8643c','#e8c89a','#b04a5a','#d8a050','#8a6aa0','#f0e0c0','#6a8ab0','#c0503a'];
    const land=(c,l,x,y)=>{ const S=2*Q-2; if(l.k===4){ c.fillStyle='#1a4a8a'; c.fillRect(x,y,S,S); c.fillStyle='#3a7ac0'; for(let i=0;i<4;i++)c.fillRect(x+2+(i*7+(s.t*6|0))%26,y+4+i*7,5,1); c.fillStyle='#8a5a3a'; c.fillRect(x+S-8,y,8,S); c.fillStyle='#fff'; c.fillRect(x+8,y+12,12,6); c.fillStyle='#ff3c5a'; c.fillRect(x+12,y+9,2,3); return; }
      c.fillStyle=['#8a7a6a','#c88a7a','#b08a50','#4a8a4a'][l.k]; c.fillRect(x,y,S,S);
      if(l.k===0){ c.fillStyle='#d8c8a8'; c.beginPath(); c.arc(x+S/2,y+S/2,9,0,7); c.fill(); c.fillStyle='#5a3a2a'; c.beginPath(); c.arc(x+S/2,y+S/2,5,0,7); c.fill(); c.fillStyle='#2a1a14'; c.fillRect(x+S/2-1,y+S/2-1,2,2); }
      else if(l.k===1){ c.fillStyle='#e8a890'; c.beginPath(); c.arc(x+S/2,y+S/2,8,0,7); c.fill(); c.fillStyle='#8aa0b0'; c.beginPath(); c.arc(x+S/2,y+S/2,5,0,7); c.fill(); c.fillStyle='#f0e8e0'; for(const [a,b] of [[3,3],[S-5,3],[3,S-5],[S-5,S-5]])c.fillRect(x+a,y+b,2,2); }
      else if(l.k===2){ for(let i=0;i<5;i++){ c.fillStyle=i%2?'#ff3c5a':'#ffe8c0'; c.fillRect(x+2,y+2+i*5,S-4,3); } }
      else { c.fillStyle='#6aaa6a'; c.fillRect(x+3,y+3,S-6,S-6); c.fillStyle='#ff3c5a'; c.fillRect(x+S/2-2,y+S/2-2,4,4); } };
    s.draw=c=>{ c.fillStyle='#3a3a44'; c.fillRect(0,OY,W,H-OY);
      for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){ if(road(x,y)){ if(x%3===0&&y%3===0)continue; c.fillStyle='#d8d0b0'; if(x%3===0&&y%2)c.fillRect(x*Q+7,OY+y*Q+2,2,10); if(y%3===0&&x%2)c.fillRect(x*Q+2,OY+y*Q+7,10,2); continue; }
        if(x%3===1&&y%3===1){ const l=LM.find(q=>q.b[0]===(x-1)/3&&q.b[1]===(y-1)/3); c.fillStyle='#22202a'; c.fillRect(x*Q+1,OY+y*Q+1,2*Q-2,2*Q-2); if(l){ land(c,l,x*Q+1,OY+y*Q+1); continue; }
          const col=BC[(x*7+y*13)%BC.length]; c.fillStyle=col; c.fillRect(x*Q+2,OY+y*Q+2,2*Q-5,2*Q-5); c.fillStyle='rgba(0,0,0,.25)'; for(let j=0;j<3;j++)for(let i=0;i<3;i++)c.fillRect(x*Q+6+i*8,OY+y*Q+6+j*8,4,4);
          if((x+y)%4===0){ c.fillStyle='#4a8a4a'; c.beginPath(); c.arc(x*Q+16,OY+y*Q+16,5,0,7); c.fill(); } } }
      if(s.lm&&s.dst){ const [bx,by]=s.lm.b; c.strokeStyle=Math.floor(s.t*4)%2?'#5aff6a':'#ffe83c'; c.lineWidth=2; c.strokeRect((3*bx+1)*Q,OY+(3*by+1)*Q,2*Q,2*Q); c.lineWidth=1; }
      const pin=(p,col)=>{ const X_=p[0]*Q+8, Y_=OY+p[1]*Q+8; c.fillStyle=col; c.beginPath(); c.arc(X_,Y_-3,4,0,7); c.fill(); c.fillRect(X_-1,Y_,2,6); };
      if(!s.dst){ if(Math.floor(s.t*4)%2){ const X_=s.pas[0]*Q+8, Y_=OY+s.pas[1]*Q+8; c.fillStyle='#ffd8b0'; c.fillRect(X_-1,Y_-6,3,3); c.fillStyle='#ff3ca8'; c.fillRect(X_-2,Y_-3,5,6); c.fillStyle='#fff'; c.fillRect(X_+3,Y_-7,1,4); } }
      else pin(s.dst,Math.floor(s.t*4)%2?'#5aff6a':'#ffe83c');
      const car=(e,col,taxiOn)=>{ const [x,y]=at(e), d=e.d||e.n||'R', hz=d==='L'||d==='R', ln=e.mini?15:12, w=hz?ln:8, h=hz?8:ln, X_=x*Q+8, Y_=OY+y*Q+8; c.fillStyle='#000'; c.fillRect(X_-w/2,Y_-h/2+1,w,h);
        c.fillStyle=col; c.fillRect(X_-w/2,Y_-h/2,w,h); if(e.mini){ c.fillStyle='#2a6aff'; if(hz)c.fillRect(X_-w/2,Y_-1,w,2); else c.fillRect(X_-1,Y_-h/2,2,h); }
        c.fillStyle='#1a2030'; if(hz)c.fillRect(X_+(d==='R'?1:-4),Y_-3,3,6); else c.fillRect(X_-3,Y_+(d==='D'?1:-4),6,3);
        if(taxiOn){ c.fillStyle='#141016'; for(let i=0;i<3;i++)if(hz)c.fillRect(X_-5+i*2,Y_-4+(i%2)*2,1,2); else c.fillRect(X_-4+(i%2)*2,Y_-5+i*2,2,1); if(s.ride){ c.fillStyle='#ff3ca8'; c.fillRect(X_-1,Y_-1,2,2); } } };
      for(const e of cars)car(e,e.col); if(s.cool<=0||Math.floor(s.cool*10)%2)car(taxi,'#ffd21c',1);
      c.fillStyle='#141016'; c.fillRect(0,0,W,OY); tx(c,'$'+s.score,4,4,'#ffd21c'); tx(c,'TIME '+Math.ceil(s.time),64,4,s.time<10?'#ff3c5a':'#fff',8,'center');
      if(s.ride){ const tip=Math.max(0,Math.round((s.ride.est-s.ride.t)*2)); tx(c,'METER $'+(5+s.ride.d)+(tip?'+'+tip:''),110,4,tip?'#5aff6a':'#c8a090'); }
      const g=s.dst||s.pas, [tx_,ty_]=at(taxi), a=Math.atan2(g[1]-ty_,g[0]-tx_); tx(c,s.dst?'DROP':'PICK UP',236,4,s.dst?'#5aff6a':'#ff3ca8',8,'right');
      c.save(); c.translate(246,8); c.rotate(a); c.fillStyle='#fff'; c.beginPath(); c.moveTo(6,0); c.lineTo(-4,-4); c.lineTo(-4,4); c.fill(); c.restore();
      if(s.mt>0)tx(c,s.msg,128,112,'#fff',10,'center'); pops(s,c); };
    return s; } };

  const GAMES={'RAINBOW RUN':blocks,'GALAXY RAID':raid,'MAZE':maze,'ROAD 85':road,'TELEMAK':pong,'ISTANBUL TAKSI':taksi};
  const card=(c,name,blink)=>{ const L=LORE[name], b=bests()[name]||0; c.fillStyle='#05040a'; c.fillRect(0,0,W,H);
    tx(c,name,128,30,L.col,name.length>11?16:20,'center'); tx(c,L.maker+' · '+L.place+' '+L.year,128,58,'#a090c0',8,'center'); tx(c,L.tag,128,80,'#e8f0ff',8,'center');
    L.story.forEach((l,i)=>tx(c,l,128,104+i*11,'#7a6a90',7,'center')); tx(c,'HI-SCORE '+b,128,146,'#ffe83c',10,'center'); if(blink)tx(c,'INSERT $2',128,176,'#5aff6a',10,'center'); tx(c,'©'+L.year+' '+L.maker,128,206,'#4a3a60',7,'center'); };
  const crt=c=>{ c.fillStyle='rgba(0,0,0,.28)'; for(let y=0;y<H;y+=2)c.fillRect(0,y,W,1); const v=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.55)'); c.fillStyle=v; c.fillRect(0,0,W,H);
    const g=c.createLinearGradient(0,0,W,H); g.addColorStop(0,'rgba(255,255,255,.10)'); g.addColorStop(.35,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,W,H); };
  const demo=name=>{ const G=GAMES[name], cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); let g=null, t=0, page=1, kt=0, dead=0; const K={}, T={};
    return {cv,step(dt){ t+=dt; MUTE=true; try{ if(page===0){ if(!g)g=G.make(); kt-=dt; if(kt<=0){ kt=.15+R()*.45; for(const k of 'LRUDF')K[k]=0; const k='LRUDF'[ri(5)]; K[k]=1; T[k]=1; if(name==='ROAD 85')K.U=1; }
        g.step(dt,K,T); for(const k in T)delete T[k]; if(g.over){ dead+=dt; if(dead>2){ g=null; dead=0; page=1; t=0; } } else if(t>30){ g=null; page=1; t=0; } } else if(t>7){ page=0; t=0; } } finally{ MUTE=false; } },
      draw(){ if(page===0&&g)g.draw(c); else card(c,name,Math.floor(performance.now()/500)%2); if(page===0)tx(c,'INSERT $2',128,4+(name==='MAZE'?208:0),Math.floor(performance.now()/500)%2?'#5aff6a':'rgba(0,0,0,0)',8,'center'); crt(c); }}; };

  const open=(name,skill)=>{ if(C.on)return; const G=GAMES[name], L=LORE[name]; if(!G)return;
    const box=document.createElement('div'); box.id='cabwin';
    box.style.cssText='position:fixed;inset:0;z-index:40;background:radial-gradient(circle at 50% 45%,rgba(30,12,40,.9),rgba(2,1,4,.96));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:bold 13px monospace;color:#fff;user-select:none;touch-action:none';
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; cv.style.cssText=`image-rendering:pixelated;width:min(94vw,calc((100vh - 170px)*256/224));aspect-ratio:256/224;border:10px solid #120c18;border-radius:14px;box-shadow:0 0 0 3px ${L.col}55,0 0 60px ${L.col}40,inset 0 0 30px #000`;
    const top=document.createElement('div'); top.textContent=name; top.style.cssText=`font-size:22px;letter-spacing:4px;color:${L.col};text-shadow:0 0 12px ${L.col}`;
    const sub=document.createElement('div'); sub.textContent=L.maker+' · '+L.place+' '+L.year; sub.style.cssText='font-size:11px;letter-spacing:2px;color:#8a7aa0';
    const foot=document.createElement('div'); foot.style.cssText='color:#a090c0;font-size:12px'; foot.textContent='SPACE TO START · ESC TO LEAVE';
    box.append(top,sub,cv,foot); const c=cv.getContext('2d');
    const K={L:0,R:0,U:0,D:0,F:0,H:0}, T={}, map=k=>({arrowleft:'L',a:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',arrowdown:'D',s:'D',' ':'F',enter:'F',z:'F',x:'F',c:'H',shift:'H'})[k];
    if(matchMedia('(pointer:coarse)').matches){ const pad=document.createElement('div'); pad.style.cssText='display:flex;gap:10px';
      for(const [k,l] of [['L','◀'],['U','▲'],['D','▼'],['R','▶'],['F','●'],...(name==='RAINBOW RUN'?[['H','H']]:[]),['X','✕']]){ const b=document.createElement('button'); b.textContent=l; b.style.cssText='width:50px;height:46px;font-size:20px;background:#241a30;color:#fff;border:2px solid #5a3a70;border-radius:8px';
        b.onpointerdown=e=>{ e.preventDefault(); if(k==='X')return close(); if(!K[k])T[k]=1; K[k]=1; }; b.onpointerup=b.onpointerleave=()=>{ if(k!=='X')K[k]=0; }; pad.append(b); } box.append(pad); }
    const kd=e=>{ e.stopPropagation(); const k=(e.key||'').toLowerCase(); if(k==='escape'){ e.preventDefault(); close(); return; } const m=map(k); if(!m)return; e.preventDefault(); if(!e.repeat&&!K[m])T[m]=1; K[m]=1; };
    const ku=e=>{ e.stopPropagation(); const m=map((e.key||'').toLowerCase()); if(m)K[m]=0; }, blur=()=>{ for(const k in K)K[k]=0; };
    let mode='title', g=null, wait=0, msg='', nb=false;
    const coin=()=>{ if(INV.cash<2){ msg='YOU NEED $2 TO PLAY'; beep(120,.2); return false; } INV.cash-=2; msg=''; beep(988,.08); setTimeout(()=>beep(1319,.15),80); return true; };
    const end=()=>{ mode='over'; wait=1.2; nb=setBest(name,g.score); if(nb)beep(1568,.6,'square',.05,2093); const amt=1+G.grade.filter(v=>g.score>=v).length; if(skill)FORAGE.train(skill,400,0,amt); foot.textContent='SPACE TO PLAY AGAIN ($2) · ESC TO LEAVE'; };
    const close=()=>{ if(!C.on)return; C.on=false; C.tick=null; removeEventListener('keydown',kd,true); removeEventListener('keyup',ku,true); removeEventListener('blur',blur); box.remove(); keys.clear(); };
    C.close=close; C.dbg=()=>({name,mode,score:g?g.score:0,over:g?g.over:false});
    C.tick=dt=>{ if(mode==='title'||mode==='over'){ wait=Math.max(0,wait-dt); if(T.F&&wait<=0&&coin()){ g=G.make(); mode='play'; nb=false; foot.textContent='ESC TO LEAVE'; } }
      else if(mode==='play'){ g.step(dt,K,T); if(g.over)end(); }
      for(const k in T)delete T[k];
      const bl=Math.floor(performance.now()/400)%2;
      if(mode==='title'&&!g){ card(c,name,false); G.help.forEach((l,i)=>tx(c,l,128,166+i*11,'#e8f0ff',8,'center')); tx(c,msg||(bl?'INSERT $2 · PRESS SPACE':''),128,192,msg?'#ff3c5a':'#5aff6a',8,'center'); return; }
      g.draw(c);
      if(mode!=='play'){ c.fillStyle='rgba(0,0,0,.65)'; c.fillRect(20,62,216,104); c.strokeStyle=L.col; c.strokeRect(20.5,62.5,215,103);
        tx(c,'GAME OVER',128,72,'#ff3c5a',14,'center'); tx(c,'SCORE '+g.score,128,94,'#fff',10,'center'); tx(c,nb?'NEW HIGH SCORE!':'HI-SCORE '+(bests()[name]||0),128,110,nb&&bl?'#ffe83c':'#a090c0',8,'center');
        tx(c,msg||(bl?'INSERT $2 · PRESS SPACE':''),128,146,msg?'#ff3c5a':'#5aff6a',8,'center'); } };
    keys.clear(); addEventListener('keydown',kd,true); addEventListener('keyup',ku,true); addEventListener('blur',blur); document.body.append(box); C.on=true; beep(660,.1); };
  return C.K={GAMES,LORE,open,demo,crt}; };
