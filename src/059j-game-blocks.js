// THE ARCADE'S RAINBOW RUN: falling blocks for its cabinet (a hold, three next pieces, a fair bag, combos); its own chunk, fetched the first time you play it.
import {STORE} from './006-map-pre.js';
STORE.cabs.add({name:'RAINBOW RUN',skill:'bird',hold:1,lore:{maker:'KOSMO-ELEKTRON',place:'LENINGRAD',year:1984,col:'#ff3c5a',tag:'SEVEN COLOURS FALL OVER THE NEVA',story:['BUILT AFTER HOURS IN AN INSTITUTE','BASEMENT; SMUGGLED WEST IN RADIO CRATES.']},
  game:L=>{ '@blocks'; const {W,H,R,ri,cl,tx,bmp,beep,DIRS,OPP,mv,at,held,pops,popTick}=L;
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
  return blocks; }});
