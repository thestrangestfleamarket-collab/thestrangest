// THE ARCADE'S MAZE: dots and four ghosts for its cabinet (scatter and chase, bonus fruit, a second maze on even levels); its own chunk, fetched the first time you play it.
import {STORE} from './006-map-pre.js';
STORE.cabs.add({name:'MAZE',skill:'gem',lore:{maker:'MIDWEST AMUSEMENT CO.',place:'CHICAGO',year:1981,col:'#ffe83c',tag:'FOUR GHOSTS. ONE APPETITE.',story:['THE SERVICE MANUAL NAMES THE GHOSTS:','RUBY, PEARL, SKY AND AMBER.']},
  game:L=>{ '@maze'; const {W,H,R,ri,cl,tx,bmp,beep,DIRS,OPP,mv,at,held,pops,popTick}=L;
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
  maze.insert=212;
  return maze; }});
