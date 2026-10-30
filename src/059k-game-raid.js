// THE ARCADE'S GALAXY RAID: the invaders for its cabinet (waves, diving aliens from wave 2, a mystery saucer, extra ships); its own chunk, fetched the first time you play it.
import {STORE} from './006-map-pre.js';
STORE.cabs.add({name:'GALAXY RAID',skill:'sword',lore:{maker:'TAIYO DENKI',place:'OSAKA',year:1979,col:'#ff3ca8',tag:'THEY CAME FOR THE COINS',story:['SO POPULAR IT EMPTIED THE HUNDRED-YEN','COINS OF A WHOLE WARD, OR SO THEY SAY.']},
  game:L=>{ '@raid'; const {W,H,R,ri,cl,tx,bmp,beep,DIRS,OPP,mv,at,held,pops,popTick}=L;
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
  return raid; }});
