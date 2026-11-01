// THE ARCADE'S PETRI: the dish for its cabinet (in the line of agar.io; docs/arcade/petri.md): cells in one dish eating pellets and each other, split and eject, viruses, bots filling the dish; its own chunk, fetched the first time you play it. The simulation (DISH) is one path for the client, its bots and, later, the worker's shared dish.
import {STORE} from './006-map-pre.js';
STORE.cabs.add({name:'PETRI',skill:'alch',hold:1,lore:{maker:'NODE 9',place:'BERLIN',year:2015,col:'#7aff6a',tag:"EAT. SPLIT. DON'T GET EATEN.",story:['ONE DISH FOR THE WHOLE MARKET.','THE BIGGEST CELL WEARS THE CROWN.']},
  game:L=>{ '@petri'; const {W,H,R,cl,tx,beep,pops,popTick}=L;
  const DW=6000, DH=6000, NP=1000, NV=30, FILL=12, MINSPLIT=35, MAXCELLS=16, EJECT=13, EJECTCOST=18, VIRUSM=100;
  const COLS=['#ff3c5a','#ff8a2a','#ffe83c','#5aff6a','#3cf0ff','#2a7bff','#a46bff','#ff70ff','#7aff6a','#ffb020','#60c0ff','#e8e8f0'];
  const BOTS=['THE RADISH','THE OPERATOR','THE FIXER','SONIEE','THE TIGER','THE STUMP','GLASSHORN','THE EYE','PETTY','THE GUARDIAN','BLUEHOUR','THE SCANNER','THE BUSKER','THE GHOST'];
  const rad=m=>4+Math.sqrt(m)*6, spd=m=>330*Math.pow(m,-.3), mergeT=m=>30+.02*m;
  const rng=seed=>{ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; };
  // the dish: pellets, viruses, blobs, cells by owner; every rule of the game in step(), nothing in the drawing
  const DISH={
    make:seed=>{ const S={t:0,next:1,rnd:rng(seed||1),cells:[],pellets:[],viruses:[],blobs:[],players:{},board:[]}; for(let i=0;i<NP;i++)DISH.pellet(S); for(let i=0;i<NV;i++)DISH.virus(S); return S; },
    pellet:S=>{ S.pellets.push({x:S.rnd()*DW,y:S.rnd()*DH,c:Math.floor(S.rnd()*COLS.length)}); },
    virus:(S,x,y,vx,vy)=>{ S.viruses.push({x:x??S.rnd()*DW,y:y??S.rnd()*DH,m:VIRUSM,fed:0,vx:vx||0,vy:vy||0}); },
    join:(S,id,name,col,bot)=>{ const p={id,name,col,bot:!!bot,dir:[0,0],split:0,eject:0,best:0,eaten:0,dead:0,n:0,think:S.rnd()}; S.players[id]=p; DISH.spawn(S,p); return p; },
    leave:(S,id)=>{ S.cells=S.cells.filter(c=>c.o!==id); delete S.players[id]; },
    spawn:(S,p)=>{ let x=0, y=0; for(let k=0;k<20;k++){ x=200+S.rnd()*(DW-400); y=200+S.rnd()*(DH-400); if(!S.cells.some(c=>Math.hypot(c.x-x,c.y-y)<c.r+300))break; } DISH.cell(S,p,10,x,y,0,0); p.dead=0; },
    cell:(S,p,m,x,y,vx,vy)=>{ const c={id:S.next++,o:p.id,m,r:rad(m),x,y,vx,vy,mt:S.t+mergeT(m)}; S.cells.push(c); p.n++; return c; },
    input:(S,id,dx,dy,split,eject)=>{ const p=S.players[id]; if(!p)return; const n=Math.hypot(dx,dy); p.dir=n>.05?[dx/n,dy/n]:[0,0]; if(split)p.split=1; if(eject)p.eject=1; },
    mass:(S,id)=>{ let m=0; for(const c of S.cells)if(c.o===id)m+=c.m; return m; },
    split:(S,p)=>{ const mine=S.cells.filter(c=>c.o===p.id).sort((a,b)=>b.m-a.m); let n=mine.length; for(const c of mine){ if(n>=MAXCELLS||c.m<MINSPLIT)continue; const [dx,dy]=p.dir[0]||p.dir[1]?p.dir:[1,0]; c.m/=2; c.r=rad(c.m); c.mt=S.t+mergeT(c.m); const h=DISH.cell(S,p,c.m,c.x+dx*c.r,c.y+dy*c.r,dx*spd(c.m)*3,dy*spd(c.m)*3); h.boost=1; n++; } },
    burst:(S,c,p)=>{ const k=Math.min(MAXCELLS-p.n+1,Math.max(2,Math.floor(c.m/MINSPLIT))); if(k<2)return; const each=c.m/k; c.m=each; c.r=rad(each); c.mt=S.t+mergeT(each); for(let i=1;i<k;i++){ const a=i/k*Math.PI*2; const h=DISH.cell(S,p,each,c.x,c.y,Math.cos(a)*spd(each)*3,Math.sin(a)*spd(each)*3); h.boost=1; } },
    eject:(S,p)=>{ for(const c of S.cells){ if(c.o!==p.id||c.m<MINSPLIT)continue; const [dx,dy]=p.dir[0]||p.dir[1]?p.dir:[1,0]; c.m-=EJECTCOST; c.r=rad(c.m); S.blobs.push({x:c.x+dx*(c.r+8),y:c.y+dy*(c.r+8),vx:dx*600,vy:dy*600,m:EJECT,c:p.col,dx,dy}); } },
    board:S=>{ const t=[]; for(const id in S.players){ const p=S.players[id]; if(!p.dead)t.push({id,name:p.name,m:Math.round(DISH.mass(S,id))}); } t.sort((a,b)=>b.m-a.m); S.board=t.slice(0,10); },
    step:(S,dt)=>{ S.t+=dt; const P=S.players;
      for(const c of S.cells){ const p=P[c.o]; if(!p)continue; const v=spd(c.m); if(c.boost){ c.vx*=Math.pow(.02,dt); c.vy*=Math.pow(.02,dt); if(Math.hypot(c.vx,c.vy)<v*1.1)c.boost=0; }
        const tx_=p.dir[0]*v, ty_=p.dir[1]*v; if(!c.boost){ c.vx+=(tx_-c.vx)*Math.min(1,dt*6); c.vy+=(ty_-c.vy)*Math.min(1,dt*6); } else { c.vx+=tx_*dt*2; c.vy+=ty_*dt*2; }
        c.x=cl(c.x+c.vx*dt,c.r*.5,DW-c.r*.5); c.y=cl(c.y+c.vy*dt,c.r*.5,DH-c.r*.5); if(c.m>100)c.m-=c.m*.002*dt; c.r=rad(c.m); }
      for(const b of S.blobs){ b.x=cl(b.x+b.vx*dt,0,DW); b.y=cl(b.y+b.vy*dt,0,DH); b.vx*=Math.pow(.01,dt); b.vy*=Math.pow(.01,dt); }
      for(const v of S.viruses){ if(v.vx||v.vy){ v.x=cl(v.x+v.vx*dt,0,DW); v.y=cl(v.y+v.vy*dt,0,DH); v.vx*=Math.pow(.01,dt); v.vy*=Math.pow(.01,dt); if(Math.hypot(v.vx,v.vy)<5)v.vx=v.vy=0; } }
      for(const id in P){ const p=P[id]; if(p.split){ p.split=0; DISH.split(S,p); } if(p.eject){ p.eject=0; DISH.eject(S,p); } }
      // your own cells push apart until they may merge, then they flow together
      for(let i=0;i<S.cells.length;i++)for(let j=i+1;j<S.cells.length;j++){ const a=S.cells[i], b=S.cells[j]; if(a.o!==b.o)continue; const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1, ov=a.r+b.r-d;
        if(S.t>=a.mt&&S.t>=b.mt){ if(d<Math.max(a.r,b.r)*.7){ const big=a.m>=b.m?a:b, small=big===a?b:a; big.m+=small.m; big.r=rad(big.m); small.m=0; } else { const k=Math.min(d,80*dt)/d; a.x+=dx*k; a.y+=dy*k; b.x-=dx*k; b.y-=dy*k; } }
        else if(ov>0){ const k=ov/2/d; a.x-=dx*k; a.y-=dy*k; b.x+=dx*k; b.y+=dy*k; } }
      // eating: pellets, blobs, other cells; viruses burst the big
      for(const c of S.cells){ if(!c.m)continue; const p=P[c.o]; const r2=c.r*c.r;
        for(let i=S.pellets.length-1;i>=0;i--){ const q=S.pellets[i]; const dx=q.x-c.x, dy=q.y-c.y; if(dx*dx+dy*dy<r2){ c.m+=1; S.pellets[i]=S.pellets[S.pellets.length-1]; S.pellets.pop(); } }
        for(let i=S.blobs.length-1;i>=0;i--){ const q=S.blobs[i]; const dx=q.x-c.x, dy=q.y-c.y; if(dx*dx+dy*dy<r2*.8){ c.m+=q.m; S.blobs.splice(i,1); } }
        for(const v of S.viruses){ if(c.m<=v.m*1.25)continue; const dx=v.x-c.x, dy=v.y-c.y; if(dx*dx+dy*dy<r2*.6){ v.x=S.rnd()*DW; v.y=S.rnd()*DH; v.fed=0; v.vx=v.vy=0; c.m+=v.m*.5; DISH.burst(S,c,p); } }
        c.r=rad(c.m); }
      for(const a of S.cells){ if(!a.m)continue; for(const b of S.cells){ if(a===b||!b.m||a.o===b.o||a.m<=b.m*1.25)continue; const dx=b.x-a.x, dy=b.y-a.y; if(dx*dx+dy*dy<(a.r-b.r*.4)*(a.r-b.r*.4)){ a.m+=b.m; a.r=rad(a.m); b.m=0; P[a.o].eaten++; P[a.o].ate=b.o; } } }
      for(const v of S.viruses)for(let i=S.blobs.length-1;i>=0;i--){ const q=S.blobs[i]; if(Math.hypot(q.x-v.x,q.y-v.y)<rad(v.m)){ S.blobs.splice(i,1); if(++v.fed>=7){ v.fed=0; DISH.virus(S,v.x+q.dx*60,v.y+q.dy*60,q.dx*700,q.dy*700); } } }
      if(S.cells.some(c=>!c.m)){ S.cells=S.cells.filter(c=>c.m>0); for(const id in P)P[id].n=0; for(const c of S.cells)P[c.o].n++; }
      for(const id in P){ const p=P[id]; const m=DISH.mass(S,id); if(m>p.best)p.best=m; if(!p.n&&!p.dead){ p.dead=1; p.died=S.t; } if(p.bot&&p.dead&&S.t-p.died>3){ p.eaten=0; DISH.spawn(S,p); } }
      while(S.pellets.length<NP)DISH.pellet(S); while(S.viruses.length<NV)DISH.virus(S);
      for(const id in P){ const p=P[id]; if(!p.bot&&!p.auto)continue; p.think-=dt; if(p.think>0)continue; p.think=.3; DISH.brain(S,p); }
      DISH.board(S); },
    // the bots (and the attract mode): flee the big, chase the small, else the nearest pellet
    brain:(S,p)=>{ const mine=S.cells.filter(c=>c.o===p.id); if(!mine.length)return; let cx=0, cy=0, mm=0, big=0; for(const c of mine){ cx+=c.x; cy+=c.y; mm+=c.m; big=Math.max(big,c.m); } cx/=mine.length; cy/=mine.length;
      let flee=null, fd=600, prey=null, pd=520; for(const c of S.cells){ if(c.o===p.id)continue; const d=Math.hypot(c.x-cx,c.y-cy); if(c.m>big*1.25&&d<fd){ flee=c; fd=d; } else if(c.m*1.25<big&&d<pd){ prey=c; pd=d; } }
      for(const v of S.viruses){ if(big<VIRUSM*1.25)continue; const d=Math.hypot(v.x-cx,v.y-cy); if(d<rad(big)+60&&d<fd){ flee=v; fd=d; } }
      let tx_, ty_; if(flee){ tx_=cx-(flee.x-cx); ty_=cy-(flee.y-cy); } else if(prey){ tx_=prey.x; ty_=prey.y; if(pd<rad(big)*2.2&&prey.m*2.5<big&&big>60&&mine.length<4)p.split=1; }
      else { let best=null, bd=1e9; for(let i=0;i<S.pellets.length;i+=3){ const q=S.pellets[i]; const d=(q.x-cx)*(q.x-cx)+(q.y-cy)*(q.y-cy); if(d<bd){ bd=d; best=q; } } if(best){ tx_=best.x; ty_=best.y; } else { tx_=DW/2; ty_=DH/2; } }
      const n=Math.hypot(tx_-cx,ty_-cy)||1; p.dir=[(tx_-cx)/n,(ty_-cy)/n]; }
  };
  const petri={help:['ARROWS OR THE MOUSE STEER · SPACE SPLIT','C EJECT MASS · EAT THE SMALL, FLEE THE BIG'],grade:[200,1000,3000],insert:212,make:()=>{
    const s={mode:'play',score:0,over:false,t:0,pops:[],auto:0,sub:''}, S=DISH.make(Math.floor(R()*1e9)+1), ME='you', cam={x:DW/2,y:DH/2,z:.8};
    const me=DISH.join(S,ME,'YOU',COLS[Math.floor(R()*COLS.length)]); for(let i=0;i<FILL-1;i++)DISH.join(S,'bot'+i,BOTS[i%BOTS.length],COLS[(i*5+3)%COLS.length],true);
    const mine=()=>S.cells.filter(c=>c.o===ME), centre=()=>{ const m=mine(); if(!m.length)return [cam.x,cam.y]; let x=0, y=0, w=0; for(const c of m){ x+=c.x*c.m; y+=c.y*c.m; w+=c.m; } return [x/w,y/w]; };
    s.step=(dt,K,T)=>{ dt=Math.min(dt,.05); s.t+=dt; popTick(s,dt); if(s.over)return;
      if(s.auto){ me.auto=1; } else { let dx=(K.R?1:0)-(K.L?1:0), dy=(K.D?1:0)-(K.U?1:0); if(!dx&&!dy&&K.mx!=null){ dx=(K.mx-W/2)/40; dy=(K.my-(H/2+8))/40; if(Math.hypot(dx,dy)<.25)dx=dy=0; } DISH.input(S,ME,dx,dy,T.F,T.H); if(T.F)beep(700,.05,'square',.04,900); if(T.H)beep(400,.05,'square',.03,300); }
      const was=me.eaten; DISH.step(S,dt); if(me.eaten>was){ beep(900,.08,'square',.05,1400); s.pops.push({s:'ATE '+(S.players[me.ate]?S.players[me.ate].name:'?'),x:W/2,y:H/2-20,t:1.2,c:'#ffe83c'}); }
      s.score=Math.round(me.best); if(me.dead){ s.over=true; s.sub='MASS '+Math.round(me.best)+' · '+me.eaten+' EATEN'; beep(120,.8,'sawtooth',.08,40); }
      const [cx,cy]=centre(), mass=DISH.mass(S,ME), z=1/(1+Math.sqrt(Math.max(mass,10))/20); cam.x+=(cx-cam.x)*Math.min(1,dt*6); cam.y+=(cy-cam.y)*Math.min(1,dt*6); cam.z+=(z-cam.z)*Math.min(1,dt*3); };
    const sx=x=>(x-cam.x)*cam.z+W/2, sy=y=>(y-cam.y)*cam.z+H/2+8;
    s.draw=c=>{ c.fillStyle='#0b1210'; c.fillRect(0,0,W,H); const z=cam.z, g=100*z; c.strokeStyle='#14201a'; c.lineWidth=1; c.beginPath(); for(let x=sx(Math.floor((cam.x-W/2/z)/100)*100);x<W;x+=g){ c.moveTo(Math.round(x)+.5,16); c.lineTo(Math.round(x)+.5,H); } for(let y=sy(Math.floor((cam.y-H/2/z)/100)*100);y<H;y+=g){ c.moveTo(0,Math.round(y)+.5); c.lineTo(W,Math.round(y)+.5); } c.stroke();
      c.strokeStyle='#3a5a44'; c.lineWidth=2; c.strokeRect(sx(0),sy(0),DW*z,DH*z);
      const vis=(x,y,r)=>x+r>-10&&x-r<W+10&&y+r>6&&y-r<H+10;
      for(const q of S.pellets){ const x=sx(q.x), y=sy(q.y); if(!vis(x,y,2))continue; c.fillStyle=COLS[q.c]; c.fillRect(x-1,y-1,Math.max(2,3*z*2),Math.max(2,3*z*2)); }
      for(const q of S.blobs){ const x=sx(q.x), y=sy(q.y), r=Math.max(2,rad(q.m)*z); if(!vis(x,y,r))continue; c.fillStyle=q.c; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
      for(const v of S.viruses){ const x=sx(v.x), y=sy(v.y), r=rad(v.m)*z; if(!vis(x,y,r))continue; c.fillStyle='#3aa83a'; c.beginPath(); for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, rr=i%2?r:r*.86; c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); c.strokeStyle='#5aff6a'; c.lineWidth=1; c.stroke(); }
      const top=S.board[0]&&S.board[0].id; for(const q of [...S.cells].sort((a,b)=>a.m-b.m)){ const x=sx(q.x), y=sy(q.y), r=q.r*z; if(!vis(x,y,r))continue; const p=S.players[q.o]; c.fillStyle=p.col; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=Math.max(1,r*.08); c.stroke();
        if(r>9){ tx(c,p.name,x,y-4,'#fff',Math.min(8,Math.max(5,r/4)),'center'); if(q.o===ME&&r>16)tx(c,String(Math.round(q.m)),x,y+6,'#e8f0ff',6,'center'); } if(q.o===top&&r>6){ c.fillStyle='#ffe83c'; c.beginPath(); c.moveTo(x-6,y-r-2); c.lineTo(x-3,y-r-8); c.lineTo(x,y-r-3); c.lineTo(x+3,y-r-8); c.lineTo(x+6,y-r-2); c.closePath(); c.fill(); } }
      pops(s,c);
      c.fillStyle='rgba(0,0,0,.7)'; c.fillRect(0,0,W,16); tx(c,'MASS '+Math.round(DISH.mass(S,ME)),4,4,'#7aff6a',7); tx(c,Object.keys(S.players).length+' IN THE DISH',W/2,4,'#a090c0',7,'center'); tx(c,String(s.score),W-4,4,'#fff',7,'right');
      c.fillStyle='rgba(0,0,0,.55)'; c.fillRect(W-64,18,62,8*Math.min(8,S.board.length)+12); tx(c,'TOP',W-33,20,'#ffe83c',6,'center'); S.board.slice(0,8).forEach((e,i)=>tx(c,(i+1)+' '+e.name.slice(0,9),W-62,28+i*8,e.id===ME?'#7aff6a':'#e8f0ff',6));
      c.fillStyle='rgba(0,0,0,.55)'; c.fillRect(2,H-44,42,42); c.fillStyle='#3a5a44'; c.fillRect(3,H-43,40,40); for(const q of mine()){ c.fillStyle=me.col; c.fillRect(3+q.x/DW*40-1,H-43+q.y/DH*40-1,3,3); }
      if(s.over){ c.fillStyle='rgba(0,0,0,.5)'; c.fillRect(0,16,W,H-16); } };
    s.dbg=()=>({t:s.t,sub:s.sub,mass:DISH.mass(S,ME),best:me.best,cells:me.n,eaten:me.eaten,dead:me.dead,over:s.over,pellets:S.pellets.length,blobs:S.blobs.length,viruses:S.viruses.length,players:Object.keys(S.players).length,board:S.board.slice(0,3).map(e=>e.name+' '+e.m),x:centre()[0],y:centre()[1],auto:s.auto});
    s.cheat={grow:m=>{ const c=mine()[0]; if(c){ c.m=m; c.r=rad(m); } },merge:()=>{ for(const c of mine())c.mt=0; },pellet:(dx,dy)=>{ const [x,y]=centre(); S.pellets.push({x:x+dx,y:y+dy,c:0}); },virus:(dx,dy)=>{ const [x,y]=centre(); DISH.virus(S,x+dx,y+dy); },
      bot:(i,m,dx,dy)=>{ const p=S.players['bot'+i]; const [x,y]=centre(); for(const c of S.cells)if(c.o===p.id)c.m=0; S.cells=S.cells.filter(c=>c.m>0); p.n=0; p.dead=0; const c=DISH.cell(S,p,m,x+dx,y+dy,0,0); return c.id; },still:()=>{ for(const id in S.players)if(id!==ME){ S.players[id].bot=false; S.players[id].dir=[0,0]; } },auto:on=>{ s.auto=on?1:0; me.auto=on?1:0; }};
    window.PETRIDBG=()=>Object.assign(s.dbg(),{cheat:s.cheat}); return s; } };
  petri.attract=(K,g)=>{ g.cheat.auto(1); };
  return petri; }});
